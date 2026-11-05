"""Independent inert regression for interrupted exclusive creation acknowledgement.

Only OwnedPaths is AST-extracted from owned source. The wrapper is never imported
or invoked; all filesystem operations below are in-memory fakes.
"""
import ast
import builtins
from pathlib import Path, PurePosixPath
import stat
from types import SimpleNamespace
import unittest

SOURCE = Path(__file__).with_name("run_pinned_runtime_availability.py").read_text(encoding="utf-8")
TREE = ast.parse(SOURCE)
CLASSES = [node for node in TREE.body if isinstance(node, ast.ClassDef) and node.name == "OwnedPaths"]


class MemoryOS:
    O_CREAT = 64
    O_EXCL = 128
    O_WRONLY = 1
    O_NOFOLLOW = 131072

    def __init__(self, interrupt=None):
        self.interrupt = interrupt
        self.entries = {}
        self.deleted = []
        self.closed = []
        self.next_inode = 10
        self.next_fd = 100
        self.path = SimpleNamespace(realpath=lambda path: str(path))
        self._add(PurePosixPath('/owned'), stat.S_IFDIR | 0o700)
        self.foreign = PurePosixPath('/owned/foreign.txt')
        self._add(self.foreign, stat.S_IFREG | 0o600)
        self.foreign_identity = self.identity(self.entries[self.foreign])

    @staticmethod
    def identity(record):
        return record.st_dev, record.st_ino, record.st_mode

    def _add(self, path, mode):
        self.next_inode += 1
        self.entries[path] = SimpleNamespace(st_dev=7, st_ino=self.next_inode, st_mode=mode, st_blocks=8, st_size=0)

    def _create(self, operation, path, mode):
        path = PurePosixPath(path)
        if path in self.entries:
            raise FileExistsError('inert-preexisting')
        self._add(path, mode)
        if self.interrupt == operation:
            # Model successful mutation followed by lost acknowledgement before registration.
            raise TimeoutError('inert-after-mutation-before-acknowledgement')

    def lstat(self, path):
        path = PurePosixPath(path)
        if path not in self.entries:
            raise FileNotFoundError('inert-absent')
        return self.entries[path]

    def statvfs(self, _path):
        return SimpleNamespace(f_frsize=4096)

    def mkdir(self, path, mode=0o700):
        self._create('mkdir', path, stat.S_IFDIR | mode)

    def open(self, path, flags, mode=0o600):
        if flags & (self.O_CREAT | self.O_EXCL) != (self.O_CREAT | self.O_EXCL):
            raise AssertionError('expected-exclusive-create')
        self._create('open', path, stat.S_IFREG | mode)
        self.next_fd += 1
        return self.next_fd

    def symlink(self, target, path):
        self._create('symlink', path, stat.S_IFLNK | 0o777)

    def close(self, fd):
        self.closed.append(fd)

    def chmod(self, path, mode, follow_symlinks=False):
        path = PurePosixPath(path)
        st = self.lstat(path)
        st.st_mode = stat.S_IFMT(st.st_mode) | mode

    def _remove(self, path):
        path = PurePosixPath(path)
        self.lstat(path)
        self.deleted.append(path)
        del self.entries[path]

    def unlink(self, path):
        self._remove(path)

    def rmdir(self, path):
        self._remove(path)


def require(value):
    if not value:
        raise ValueError('inert-requirement')


def extracted_owner(memory):
    if len(CLASSES) != 1 or CLASSES[0].bases or CLASSES[0].decorator_list:
        raise AssertionError('expected-only-plain-OwnedPaths-class')
    if any(isinstance(node, (ast.Import, ast.ImportFrom)) for node in ast.walk(CLASSES[0])):
        raise AssertionError('no-imports-inside-inert-extracted-class')
    names = ['__build_class__', 'staticmethod', 'len', 'min', 'max', 'bool', 'dict', 'sorted',
             'BaseException', 'Exception', 'ValueError', 'TimeoutError', 'FileExistsError',
             'FileNotFoundError', 'type', 'str', 'int', 'set', 'tuple', 'list', 'isinstance', 'getattr', 'hasattr']
    namespace = {'__builtins__': {name: getattr(builtins, name) for name in names},
                 '__name__': 'inert_owned_paths', 'os': memory, 'stat': stat,
                 'time': SimpleNamespace(monotonic=lambda: 1), 'require': require,
                 'MAX_DISK': 1288490188, 'RESERVE': 16 * 1048576, 'MIB': 1048576, 'CHUNK': 1048576,
                 'Path': PurePosixPath}
    module = ast.Module(body=[CLASSES[0]], type_ignores=[])
    exec(compile(ast.fix_missing_locations(module), '<inert-OwnedPaths-only>', 'exec'), namespace)
    owner = namespace['OwnedPaths'](100)
    owner.pin_anchor(PurePosixPath('/owned'))
    owner.remaining = 65536
    return owner


def invoke(owner, operation, path):
    if operation == 'mkdir':
        owner.mkdir(path)
    elif operation == 'open':
        owner.create_file(path)
    else:
        owner.symlink(path, 'owned-target')


class InterruptedOwnershipContract(unittest.TestCase):
    def test_mutation_then_timeout_cannot_claim_certain_complete_cleanup(self):
        for operation in ('mkdir', 'open', 'symlink'):
            with self.subTest(operation=operation):
                memory = MemoryOS(interrupt=operation)
                owner = extracted_owner(memory)
                path = PurePosixPath('/owned/new-' + operation)
                with self.assertRaises(TimeoutError):
                    invoke(owner, operation, path)
                self.assertIn(path, memory.entries, 'fake mutation really preceded injected timeout')
                result = owner.cleanup()
                self.assertFalse(result['completed'], 'unacknowledged creation cannot support completed cleanup')
                self.assertTrue(result['uncertain'], 'pending creation outcome must remain explicit')
                self.assertEqual(memory.identity(memory.entries[memory.foreign]), memory.foreign_identity)
                self.assertNotIn(memory.foreign, memory.deleted)
                self.assertNotIn(path, memory.deleted, 'no deletion of a path without acknowledged identity')
                self.assertTrue(all(label == 'OWNED_PATH' for label in result['remaining_owned_paths']))

    def test_existing_foreign_path_is_never_registered_or_removed(self):
        for operation in ('mkdir', 'open', 'symlink'):
            with self.subTest(operation=operation):
                memory = MemoryOS()
                owner = extracted_owner(memory)
                with self.assertRaises(FileExistsError):
                    invoke(owner, operation, memory.foreign)
                owner.cleanup()
                self.assertEqual(memory.identity(memory.entries[memory.foreign]), memory.foreign_identity)
                self.assertNotIn(memory.foreign, owner.paths)
                self.assertNotIn(memory.foreign, memory.deleted)

    def test_acknowledged_owned_paths_can_be_cleaned_without_touching_foreign_path(self):
        memory = MemoryOS()
        owner = extracted_owner(memory)
        created = [PurePosixPath('/owned/new-' + operation) for operation in ('mkdir', 'open', 'symlink')]
        for operation, path in zip(('mkdir', 'open', 'symlink'), created):
            invoke(owner, operation, path)
        result = owner.cleanup()
        self.assertEqual(result, {'completed': True, 'uncertain': False, 'remaining_owned_paths': []})
        self.assertEqual(set(memory.deleted), set(created))
        self.assertEqual(memory.identity(memory.entries[memory.foreign]), memory.foreign_identity)

    def test_main_has_no_untracked_mkdtemp_primitive(self):
        # Focused source regression only: absence does not prove all main ownership semantics.
        main = next(node for node in TREE.body if isinstance(node, ast.FunctionDef) and node.name == 'main')
        calls = [node for node in ast.walk(main) if isinstance(node, ast.Call)]
        unsafe = [node for node in calls if isinstance(node.func, ast.Attribute)
                  and isinstance(node.func.value, ast.Name) and node.func.value.id == 'tempfile'
                  and node.func.attr == 'mkdtemp']
        self.assertEqual(unsafe, [], 'temporary root must use the guarded ownership creation path')


if __name__ == '__main__':
    unittest.main()
