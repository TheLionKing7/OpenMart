import os
import sys

def execute_fullstack_static_analysis():
    """Programmatically verifies that full-stack safety standards are maintained."""
    print("⚡ Activating Full-Stack Genius Structural Checker...")
    violations = []

    for root, _, files in os.walk("."):
        for file in files:
            file_path = os.path.join(root, file)
            
            # Skip dependency and environmental configurations
            if any(p in file_path for p in ["node_modules", ".git", "dist", "target"]):
                continue

            try:
                with open(file_path, 'r', errors='ignore') as f:
                    content = f.read()

                    # Frontend Safety Gate
                    if file.endswith((".ts", ".tsx", ".js", ".jsx")):
                        if "process.env.SECRET_" in content or "process.env.PRIVATE_" in content:
                            if '"use client"' in content:
                                violations.append(f"🔒 FRONTEND SECURITY LEAK: Leaking server-side secret keys to client-side bundle in: {file_path}")

                    # Go Safety Gate
                    if file.endswith(".go"):
                        if "panic(" in content and "main.go" not in file:
                            violations.append(f"⚠️ GO PERFORMANCE VIOLATION: Illegal 'panic()' statement used outside main file in: {file_path}")

                    # Rust Safety Gate
                    if file.endswith(".rs"):
                        if "unsafe {" in content:
                            violations.append(f"🛡️ RUST MEMORY VIOLATION: Found banned 'unsafe' block block in: {file_path}")

            except Exception:
                pass

    if violations:
        print("\n❌ SYSTEM ARCHITECTURE QUALITY GATES FAILED:")
        for violation in violations:
            print(f"  - {violation}")
        sys.exit(1)

    print("✅ SYSTEM ARCHITECTURE QUALITY GATES PASSED: Ready for compilation.")
    sys.exit(0)

if __name__ == "__main__":
    execute_fullstack_static_analysis()
