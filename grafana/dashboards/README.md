Put exported dashboard JSON files here (optional).
After start: open Grafana at http://localhost:3000 (admin/admin),
data source is pre-provisioned (Prometheus). Create panels using:
- rate(redis_commands_processed_total[1m]) by (instance)
- redis_memory_used_bytes by (instance)
- rate(bench_pubsub_published_total[1m]) by (target)
- rate(bench_pubsub_received_total[1m]) by (target)
- rate(bench_ttl_sets_total[1m]) by (target)
