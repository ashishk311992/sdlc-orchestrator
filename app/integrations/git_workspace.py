"""Isolated on-disk git workspace for one run.

We use the local `git` binary via GitPython for clones/commits/pushes instead
of POSTing each file through the GitHub contents API, because:
  - multi-file commits are one push
  - we can read the full repo snapshot cheaply for the Dev Agent
  - diffs for the Reviewer Agent are trivial to produce
"""
from __future__ import annotations
import os
import shutil
import tempfile
from pathlib import Path
from git import Repo, GitCommandError
from app.config import get_settings
from app.logging_config import get_logger

log = get_logger(__name__)


class GitWorkspace:
    def __init__(self, repo_full_name: str, branch: str, base_branch: str) -> None:
        self._settings = get_settings()
        self.repo_full_name = repo_full_name
        self.branch = branch
        self.base_branch = base_branch
        self._dir = Path(tempfile.mkdtemp(prefix="sdlc-"))
        self._repo: Repo | None = None

    def __enter__(self) -> "GitWorkspace":
        self._clone()
        self._checkout_branch()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        try:
            shutil.rmtree(self._dir, ignore_errors=True)
        except Exception:  # pragma: no cover
            pass

    @property
    def root(self) -> Path:
        return self._dir

    def _clone_url(self) -> str:
        token = self._settings.github_app_token
        return f"https://x-access-token:{token}@github.com/{self.repo_full_name}.git"

    def _clone(self) -> None:
        log.info("git.clone", repo=self.repo_full_name)
        self._repo = Repo.clone_from(
            self._clone_url(),
            self._dir,
            branch=self.base_branch,
            depth=1,
            single_branch=False,
        )
        with self._repo.config_writer() as cw:
            cw.set_value("user", "name", "SDLC Bot")
            cw.set_value("user", "email", "sdlc-bot@users.noreply.github.com")

    def _checkout_branch(self) -> None:
        assert self._repo is not None
        try:
            self._repo.git.fetch("origin", self.branch)
            self._repo.git.checkout(self.branch)
        except GitCommandError:
            self._repo.git.checkout("-b", self.branch)

    # ---- snapshot helpers ---------------------------------------------------

    _SNAPSHOT_SKIP_DIRS = {".git", "node_modules", "dist", "build", ".venv", "venv",
                            "__pycache__", ".next", "target", "coverage", ".pytest_cache"}
    _SNAPSHOT_MAX_FILE_BYTES = 200_000

    def snapshot(self) -> dict[str, str]:
        """Return a dict of relative_path -> utf-8 content for text files."""
        out: dict[str, str] = {}
        for root, dirs, files in os.walk(self._dir):
            dirs[:] = [d for d in dirs if d not in self._SNAPSHOT_SKIP_DIRS]
            for f in files:
                p = Path(root) / f
                rel = str(p.relative_to(self._dir))
                try:
                    if p.stat().st_size > self._SNAPSHOT_MAX_FILE_BYTES:
                        continue
                    out[rel] = p.read_text(encoding="utf-8")
                except (UnicodeDecodeError, OSError):
                    continue
        return out

    # ---- mutation -----------------------------------------------------------

    def apply_patches(self, patches: list) -> None:
        for patch in patches:
            target = self._dir / patch.path
            if patch.action == "delete":
                if target.exists():
                    target.unlink()
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(patch.content, encoding="utf-8")

    def commit_and_push(self, message: str) -> str | None:
        """Stage everything, commit, push. Returns the commit sha, or None if nothing to commit."""
        assert self._repo is not None
        self._repo.git.add(A=True)
        if not self._repo.is_dirty(untracked_files=True):
            log.info("git.nothing_to_commit")
            return None
        self._repo.index.commit(message)
        self._repo.git.push("--set-upstream", "origin", self.branch)
        return self._repo.head.commit.hexsha

    def diff_against_base(self) -> str:
        assert self._repo is not None
        try:
            self._repo.git.fetch("origin", self.base_branch)
        except GitCommandError:
            pass
        return self._repo.git.diff(f"origin/{self.base_branch}...HEAD")
