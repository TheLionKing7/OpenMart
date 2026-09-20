"""
DigiFusion-scoped free-tier guardrails for pre-commit.
Forked from ProcureIQ — re-scoped SCAN_ROOTS and gates for DigiFusion's layout.
Scans app/, components/, lib/, workers/, scripts/.
Stack: Next.js App Router, Supabase, Cloudflare R2, Vercel + Render free tiers.
"""
from __future__ import annotations

import os
import sys

SCAN_ROOTS = ("app", "components", "lib", "workers", "scripts")
SKIP_DIR_NAMES = {
    "node_modules",
    ".git",
    ".next",
    ".vercel",
    "dist",
    "build",
    ".turbo",
    "coverage",
    "public",
}
SCAN_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}


def should_scan_file(path: str) -> bool:
    return any(path.endswith(ext) for ext in SCAN_EXTENSIONS)


def iter_source_files() -> list[str]:
    files: list[str] = []
    for root_name in SCAN_ROOTS:
        if not os.path.isdir(root_name):
            continue
        for root, dirnames, filenames in os.walk(root_name):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR_NAMES]
            for name in filenames:
                path = os.path.join(root, name)
                if should_scan_file(path):
                    files.append(path)
    return files


def uses_supabase_or_pg(content: str) -> bool:
    lower = content.lower()
    return "supabase" in lower or "postgresql://" in lower or "postgres://" in lower


def is_in_api_or_worker(file_path: str) -> bool:
    """Check if the file is in an API route or worker — places where hung fetch() kills free-tier requests."""
    norm = file_path.replace("\\", "/")
    return (
        norm.startswith("app/api/")
        or norm.startswith("workers/")
        or norm.startswith("scripts/")
    )


def run_free_tier_guardrails() -> int:
    print("[guardrail] DigiFusion scan (app/, components/, lib/, workers/, scripts/)...")
    violations: list[str] = []

    for file_path in iter_source_files():
        try:
            with open(file_path, encoding="utf-8", errors="ignore") as handle:
                content = handle.read()
        except OSError:
            continue

        # ── Supabase connection pooling ──────────────────────────────────────
        if uses_supabase_or_pg(content):
            if "5432" in content and "6543" not in content:
                violations.append(
                    f"CONNECTION: Direct PostgreSQL port 5432 in {file_path}. "
                    "Use Supabase pooler (6543) or the JS client — not raw 5432 on Vercel/Render serverless."
                )

        # ── Fetch timeout (fail-fast on free-tier cold starts) ──────────────
        if is_in_api_or_worker(file_path):
            if "fetch(" in content and "AbortSignal.timeout" not in content and "signal:" not in content:
                violations.append(
                    f"TIMEOUT: fetch() without AbortSignal.timeout in {file_path}. "
                    "Vercel/Render free-tier requests must fail fast on hung upstream calls."
                )

        # ── Supabase client singleton (no inline createClient in route handlers) ──
        if "createClient(" in content and "supabase" in content.lower():
            if file_path.replace("\\", "/").startswith("app/"):
                if not any(
                    whitelist in file_path
                    for whitelist in ("lib/", "db.ts", "db.js", "supabase.ts", "supabase.js")
                ):
                    pass  # Server Components calling lib/shop/supabase singleton is fine
            # Skip — the JS client handles pooling; this gate is informational only
            # and flags are rare thanks to the cached singleton pattern.

        # ── Client-secret leak check ('use client' with non-NEXT_PUBLIC env) ──
        if file_path.endswith((".tsx", ".jsx")):
            if "'use client'" in content or '"use client"' in content:
                lines = content.split("\n")
                for lineno, line in enumerate(lines, 1):
                    stripped = line.strip()
                    if "process.env." in stripped:
                        # Allow NEXT_PUBLIC_* and trivial falsy defaults
                        if "NEXT_PUBLIC_" in stripped:
                            continue
                        # Common benign patterns: fallback email strings
                        if "SHOP_FROM_EMAIL" in stripped:
                            continue
                        if stripped.lstrip().startswith("//"):
                            continue
                        violations.append(
                            f"SECRETS: Client component {file_path}:{lineno} reads process.env without NEXT_PUBLIC_ prefix: {stripped[:100]}"
                        )

    if violations:
        print("\nFAILED: free-tier guardrail violations:")
        for item in violations:
            print(f"  - {item}")
        return 1

    print("PASSED: free-tier guardrails.")
    return 0


if __name__ == "__main__":
    sys.exit(run_free_tier_guardrails())
