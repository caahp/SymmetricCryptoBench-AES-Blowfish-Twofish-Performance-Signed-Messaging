# SymmetricCryptoBench — AES, Blowfish & Twofish Performance + Signed Messaging

> A React web application that benchmarks symmetric (secret‑key) ciphers (AES, Blowfish, Twofish) using CPU and memory metrics, and provides a secure message-sending demo with digital signatures using ad‑hoc (self‑signed) certificates.

---

## Project overview

This project has two main parts:

1. **Performance study** — run controlled tests encrypting/decrypting data with AES, Blowfish and Twofish while collecting CPU and memory usage metrics. Produce reproducible results and simple visualizations (charts) in the web UI.
2. **Signed messaging** — a demo web app where a sender composes a message, signs it with the sender's private key, and the receiver verifies the signature using the sender's certificate. Both sender and receiver certificates are generated ad‑hoc (self‑signed) for demo purposes.

The goal is educational: compare throughput, latency, CPU utilization and memory footprint of the three ciphers under different payload sizes and concurrency levels, and show end‑to‑end signed message exchange in a friendly UI.

---

## Key features

* Benchmark runner for AES, Blowfish, Twofish (configurable: payload sizes, iterations, concurrency)
* CPU and memory telemetry capture during each test (per run and aggregated)
* Results view with charts and CSV export
* Message composer with digital signature and verification
* Ad‑hoc certificate generation (OpenSSL scripts + Node helper) for sender and receiver
* Dockerfile(s) for reproducible environments
* Automated test harness to reproduce experiments

---

## Tech stack (suggested)

* Frontend: React (Vite or Create React App), TypeScript, Recharts or Chart.js
* Backend: Node.js + Express (API for running benchmarks, generating keys/certificates and verifying signatures)
* Crypto libs: `crypto` (Node built-in) + `node-forge` or `tweetnacl` as helper; for Twofish/Blowfish use libraries such as `blowfish` / `twofish` npm packages or run native bindings via Wasm if needed
* Telemetry: `pidusage`, `os-utils`, or custom `psutil`-based Python script
* Containerization: Docker
* Optional: Python scripts using `PyCryptodome` for an alternative benchmark implementation

---

## How the performance study works (concept)

1. The benchmark runner repeatedly encrypts and decrypts payloads using each cipher under test.
2. For each test case (cipher, payload size, concurrency, iteration count):

   * spawn worker processes or threads that perform the crypto operations
   * sample CPU & memory usage for the process(es) at a fixed interval (e.g. 100ms)
   * record operation timestamps to compute throughput and latency
3. After the run, aggregate:

   * average / median / p95 / p99 latency
   * throughput (ops/s)
   * CPU usage (average and max)
   * memory usage (average and max)
4. Persist raw metrics to JSON/CSV and show visualizations in frontend.
   
---
## Contact / credits

Created by the project author. For questions open an issue.
