/* Linux-only inert fixture probe. Never execute candidate, shell, or skill code.
 * Arguments identify only owned synthetic fixtures; no ambient credential paths.
 * Compile statically in the admitted CI route; this file has no executor interface.
 */
#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <ifaddrs.h>
#include <limits.h>
#include <linux/capability.h>
#include <net/if.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/prctl.h>
#include <sys/stat.h>
#include <sys/syscall.h>
#include <sys/types.h>
#include <unistd.h>

extern char **environ;

static int fail(void) {
    fputs("Inert fixture probe failed.\n", stderr);
    return 1;
}

static bool fixture_path(const char *value) {
    if (!value || value[0] != '/' || strchr(value, '\n') || strchr(value, '\r') || strchr(value, ',')) return false;
    const char *part = value + 1;
    while (*part) {
        const char *end = strchr(part, '/');
        size_t size = end ? (size_t)(end - part) : strlen(part);
        if (!size || (size == 1 && part[0] == '.') || (size == 2 && part[0] == '.' && part[1] == '.')) return false;
        if (!end) return true;
        part = end + 1;
        if (!*part) return false;
    }
    return false;
}

static int close_with_error(int fd, int error) {
    if (close(fd) != 0 && error == 0) return errno;
    return error;
}

static bool read_exact(const char *file, const char *expected, int *error) {
    int fd = open(file, O_RDONLY | O_CLOEXEC | O_NOFOLLOW);
    if (fd < 0) { *error = errno; return false; }
    struct stat info;
    if (fstat(fd, &info) != 0) { *error = close_with_error(fd, errno); return false; }
    if (!S_ISREG(info.st_mode)) { *error = close_with_error(fd, EINVAL); return false; }
    char buffer[64];
    size_t used = 0;
    int problem = 0;
    for (;;) {
        ssize_t got = read(fd, buffer + used, sizeof(buffer) - used);
        if (got < 0) { if (errno == EINTR) continue; problem = errno; break; }
        if (got == 0) break;
        used += (size_t)got;
        if (used == sizeof(buffer)) { problem = EOVERFLOW; break; }
    }
    if (!problem && (used != strlen(expected) || memcmp(buffer, expected, used) != 0)) problem = EINVAL;
    *error = close_with_error(fd, problem);
    return *error == 0;
}

/* Controls must already exist. O_CREAT is reserved for the owned output file. */
static int write_exact(const char *file, const char *bytes, bool create) {
    int flags = O_WRONLY | O_CLOEXEC | O_NOFOLLOW;
    int fd = create ? open(file, flags | O_CREAT, 0600) : open(file, flags);
    if (fd < 0) return errno;
    struct stat info;
    if (fstat(fd, &info) != 0) return close_with_error(fd, errno);
    if (!S_ISREG(info.st_mode)) return close_with_error(fd, EINVAL);
    if (ftruncate(fd, 0) != 0) return close_with_error(fd, errno);
    size_t used = 0, length = strlen(bytes);
    while (used < length) {
        ssize_t wrote = write(fd, bytes + used, length - used);
        if (wrote < 0) { if (errno == EINTR) continue; return close_with_error(fd, errno); }
        if (wrote == 0) return close_with_error(fd, EIO);
        used += (size_t)wrote;
    }
    return close_with_error(fd, 0);
}

static bool interface_counts(unsigned *total, unsigned *non_loopback) {
    struct ifaddrs *list = NULL;
    if (getifaddrs(&list) != 0) return false;
    char names[64][IFNAMSIZ];
    unsigned used = 0, non_loop = 0;
    bool valid = true;
    for (const struct ifaddrs *item = list; item; item = item->ifa_next) {
        if (!item->ifa_name) continue;
        size_t length = strnlen(item->ifa_name, IFNAMSIZ);
        if (length == 0 || length == IFNAMSIZ) { valid = false; break; }
        bool seen = false;
        for (unsigned i = 0; i < used; ++i) if (strcmp(names[i], item->ifa_name) == 0) seen = true;
        if (seen) continue;
        if (used == 64) { valid = false; break; }
        memcpy(names[used++], item->ifa_name, length + 1);
        if (!(item->ifa_flags & IFF_LOOPBACK)) ++non_loop;
        /* Deliberately never inspect addresses, routes, sockets or other processes. */
    }
    freeifaddrs(list);
    *total = used;
    *non_loopback = non_loop;
    return valid;
}

static int compare_keys(const void *left, const void *right) {
    return strcmp((const char *)left, (const char *)right);
}

static bool environment_keys(char keys[32][128], unsigned *count) {
    unsigned used = 0;
    for (char **entry = environ; *entry; ++entry) {
        const char *equals = strchr(*entry, '=');
        if (!equals || equals == *entry || used == 32) return false;
        size_t length = (size_t)(equals - *entry);
        if (length >= 128) return false;
        memcpy(keys[used], *entry, length);
        keys[used++][length] = '\0';
    }
    qsort(keys, used, sizeof(keys[0]), compare_keys);
    for (unsigned i = 1; i < used; ++i) if (strcmp(keys[i - 1], keys[i]) == 0) return false;
    *count = used;
    return true;
}

static void json_string(const char *value) {
    putchar('"');
    for (const unsigned char *p = (const unsigned char *)value; *p; ++p) {
        if (*p == '"' || *p == '\\') { putchar('\\'); putchar(*p); }
        else if (*p < 0x20 || *p >= 0x7f) printf("\\u%04x", (unsigned)*p);
        else putchar(*p);
    }
    putchar('"');
}

int main(int argc, char **argv) {
    if (argc != 6) return fail();
    bool host = strcmp(argv[1], "host-positive") == 0;
    bool contained = strcmp(argv[1], "contained") == 0;
    if (!host && !contained) return fail();
    for (int i = 2; i < 6; ++i) {
        if (!fixture_path(argv[i])) return fail();
        for (int j = 2; j < i; ++j) if (strcmp(argv[i], argv[j]) == 0) return fail();
    }
    if (contained && (strcmp(argv[2], "/input/readable") || strcmp(argv[3], "/output/result.txt") || strcmp(argv[4], "/root-write-control"))) return fail();
    struct __user_cap_header_struct header = { .version = _LINUX_CAPABILITY_VERSION_3, .pid = 0 };
    struct __user_cap_data_struct caps[2] = {{0}};
    if (syscall(SYS_capget, &header, caps) != 0) return fail();
    uint64_t effective = ((uint64_t)caps[1].effective << 32) | caps[0].effective;
    uint64_t permitted = ((uint64_t)caps[1].permitted << 32) | caps[0].permitted;
    uint64_t inheritable = ((uint64_t)caps[1].inheritable << 32) | caps[0].inheritable;
    int no_new_privs = prctl(PR_GET_NO_NEW_PRIVS, 0L, 0L, 0L, 0L);
    int seccomp = prctl(PR_GET_SECCOMP, 0L, 0L, 0L, 0L);
    unsigned interfaces = 0, non_loopback = 0, key_count = 0;
    char keys[32][128];
    if (no_new_privs < 0 || seccomp < 0 || !interface_counts(&interfaces, &non_loopback) || !environment_keys(keys, &key_count)) return fail();
    bool fake_env = getenv("FIXTURE_FAKE_TOKEN") != NULL; /* Presence only. */
    int input_read_errno = 0, host_read_errno = 0;
    bool allowed_read = read_exact(argv[2], "readable-input\n", &input_read_errno);
    bool allowed_write = write_exact(argv[3], "controlled-output\n", true) == 0;
    bool host_read = read_exact(argv[5], "owned-host-canary\n", &host_read_errno);
    int input_write_errno = write_exact(argv[2], "control-write\n", false);
    int root_write_errno = write_exact(argv[4], "control-write\n", false);
    int host_write_errno = write_exact(argv[5], "control-write\n", false);
    printf("{\"mode\":\"%s\",\"uid\":%lu,\"gid\":%lu,\"pid\":%lu,\"allowedRead\":%s,\"allowedWrite\":%s,\"hostRead\":%s,\"inputWriteErrno\":%d,\"rootWriteErrno\":%d,\"hostReadErrno\":%d,\"hostWriteErrno\":%d,\"interfaces\":%u,\"nonLoopback\":%u,\"effectiveCaps\":%llu,\"permittedCaps\":%llu,\"inheritableCaps\":%llu,\"noNewPrivs\":%d,\"seccomp\":%d,\"fakeEnv\":%s,\"envKeys\":[",
        argv[1], (unsigned long)getuid(), (unsigned long)getgid(), (unsigned long)getpid(), allowed_read ? "true" : "false", allowed_write ? "true" : "false", host_read ? "true" : "false", input_write_errno, root_write_errno, host_read_errno, host_write_errno, interfaces, non_loopback, (unsigned long long)effective, (unsigned long long)permitted, (unsigned long long)inheritable, no_new_privs, seccomp, fake_env ? "true" : "false");
    for (unsigned i = 0; i < key_count; ++i) { if (i) putchar(','); json_string(keys[i]); }
    puts("]}");
    if (host) return allowed_read && allowed_write && host_read && input_write_errno == 0 && root_write_errno == 0 && host_write_errno == 0 && non_loopback >= 1 ? 0 : 1;
    const char *expected_keys[] = {"FIXTURE_VISIBLE", "HOME", "HOSTNAME", "PATH"};
    bool known_env = key_count == 4;
    for (unsigned i = 0; known_env && i < 4; ++i) if (strcmp(keys[i], expected_keys[i])) known_env = false;
    return getpid() == 1 && getuid() != 0 && getgid() != 0 && allowed_read && allowed_write && !host_read && input_write_errno == EROFS && root_write_errno == EROFS && host_read_errno == ENOENT && host_write_errno == ENOENT && interfaces >= 1 && non_loopback == 0 && effective == 0 && permitted == 0 && inheritable == 0 && no_new_privs == 1 && seccomp == 2 && !fake_env && known_env ? 0 : 1;
}
