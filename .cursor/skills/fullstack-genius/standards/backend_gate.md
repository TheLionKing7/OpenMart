# High-Performance Backend & Cloud Infrastructure Standard

## 1. Zero-Allocation Go Performance
- **Pool Memory Reusage**: For high-throughput loops, use `sync.Pool` to reuse byte slices and structures. Minimize garbage collection overhead.
- **Strict Context Handling**: Every Go network routine must accept a `context.Context` object and enforce a hard deadline to prevent zombie routines.
- **No Panics**: Handle every error explicitly. Prohibit the use of `panic()` unless the application encounters an unrecoverable structural startup failure.

## 2. Memory-Safe Rust Runtimes
- **Zero Unsafe Blocks**: The use of `unsafe` code blocks is strictly prohibited.
- **Zero-Copy Parsers**: Use zero-copy parsing techniques (e.g., `serde` borrow attributes) when decoding heavy incoming data matrices.
- **Explicit Typings**: Avoid hiding behind blind polymorphic interfaces; leverage Rust's strict enum-variant matching systems for all domain state changes.

## 3. AWS Serverless & Cloud Topology
- **Single-Responsibility Lambdas**: Keep Lambda compute packages decoupled. One function maps to one API path or event destination.
- **Resilient Event-Driven Loops**: All event loops hooking into SQS, SNS, or DynamoDB Streams must configure an explicit Dead Letter Queue (DLQ) with a retry count limit to mitigate poison-pill messages.
