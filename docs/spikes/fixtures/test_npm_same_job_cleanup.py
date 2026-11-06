"""Independent inert regression for propagation of a child's incomplete cleanup.

AST-extract only the real child_uncertain assignment from the source wrapper.
The wrapper/module/main is never imported or run; inputs and namespace are memory-only.
"""
import ast
from copy import deepcopy
from pathlib import Path
import unittest


SOURCE = Path(__file__).with_name('run_npm_same_job.py').read_text(encoding='utf-8')
TREE = ast.parse(SOURCE)


def references_npm_get(node):
    return any(isinstance(child, ast.Call) and isinstance(child.func, ast.Attribute)
               and child.func.attr == 'get' and isinstance(child.func.value, ast.Name)
               and child.func.value.id == 'npm' for child in ast.walk(node))


ASSIGNMENTS = [node for node in ast.walk(TREE)
               if isinstance(node, ast.Assign)
               and any(isinstance(target, ast.Name) and target.id == 'child_uncertain'
                       for target in node.targets)
               and references_npm_get(node.value)]


def actual_assignment(npm, already_uncertain=False):
    if len(ASSIGNMENTS) != 1:
        raise AssertionError('expected one actual npm-cleanup uncertainty assignment')
    code = compile(ast.fix_missing_locations(ast.Module(body=[ASSIGNMENTS[0]], type_ignores=[])),
                   '<owned-cleanup-assignment-only>', 'exec')
    namespace = {'npm': npm, 'child_uncertain': already_uncertain}
    try:
        exec(code, {'__builtins__': {'type': type, 'dict': dict, 'list': list}}, namespace)
    except (AttributeError, TypeError, KeyError):
        # In the real outer handler an expression error leaves the prior signal unchanged.
        # A malformed receipt must not rely on that exception to acknowledge child cleanup.
        pass
    return namespace['child_uncertain']


class ChildCleanupPropagation(unittest.TestCase):
    def test_exact_acknowledged_success_does_not_create_uncertainty(self):
        npm = {'cleanup': {'completed': True, 'failures': [], 'mutationOutcomeUncertain': False}}
        before = deepcopy(npm)
        self.assertIs(actual_assignment(npm), False)
        self.assertEqual(npm, before)

    def test_already_unknown_child_outcome_cannot_be_cleared(self):
        npm = {'cleanup': {'completed': True, 'failures': [], 'mutationOutcomeUncertain': False}}
        self.assertIs(actual_assignment(npm, already_uncertain=True), True)

    def test_incomplete_or_failed_child_cleanup_propagates(self):
        cases = [
            {'completed': False, 'failures': ['image'], 'mutationOutcomeUncertain': False},
            {'completed': False, 'failures': ['container'], 'mutationOutcomeUncertain': False},
            {'completed': False, 'failures': [], 'mutationOutcomeUncertain': False},
            {'completed': True, 'failures': ['image'], 'mutationOutcomeUncertain': False},
            {'completed': True, 'failures': [], 'mutationOutcomeUncertain': True},
        ]
        for cleanup in cases:
            with self.subTest(cleanup=cleanup):
                self.assertIs(actual_assignment({'cleanup': cleanup}), True)

    def test_missing_or_malformed_child_cleanup_is_not_acknowledged(self):
        cases = [None, [], 'unknown', False, {},
                 {'mutationOutcomeUncertain': False},
                 {'completed': True, 'mutationOutcomeUncertain': False},
                 {'completed': True, 'failures': [], 'mutationOutcomeUncertain': 0},
                 {'completed': 1, 'failures': [], 'mutationOutcomeUncertain': False},
                 {'completed': True, 'failures': (), 'mutationOutcomeUncertain': False}]
        for cleanup in cases:
            with self.subTest(cleanup=cleanup):
                self.assertIs(actual_assignment({'cleanup': cleanup}), True)
        self.assertIs(actual_assignment({}), True)


if __name__ == '__main__':
    unittest.main()
