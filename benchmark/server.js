import express from 'express';
import client from 'prom-client';
import { runPubSub } from './pubsub.js';
import { runTTL } from './ttl.js';

const app = express();
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const benchCounters = {
  pubsubPublished: new client.Counter({ name: 'bench_pubsub_published_total', help: 'Total pubsub messages published', labelNames: ['target'] }),
  pubsubReceived:  new client.Counter({ name: 'bench_pubsub_received_total', help: 'Total pubsub messages received', labelNames: ['target'] }),
  ttlSets:         new client.Counter({ name: 'bench_ttl_sets_total', help: 'Total TTL sets performed', labelNames: ['target'] }),
  ttlExpires:      new client.Counter({ name: 'bench_ttl_expires_total', help: 'Total TTL key expirations observed', labelNames: ['target'] })
};
Object.values(benchCounters).forEach(m => register.registerMetric(m));

app.get('/healthz', (_req, res) => res.send('ok'));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.post('/run/pubsub', async (req, res) => {
  const {
    target = process.env.REDIS_URL,
    duration = Number(process.env.BENCH_DURATION || 30),
    rate = Number(process.env.PUBSUB_PUBLISH_RATE || 1000),
    msgSize = Number(process.env.PUBSUB_MSG_SIZE || 100)
  } = req.body || {};
  runPubSub({ target, duration, rate, msgSize }).catch(console.error);
  res.json({ status: 'started', target, duration, rate, msgSize });
});

app.post('/run/ttl', async (req, res) => {
  const {
    target = process.env.REDIS_URL,
    duration = Number(process.env.BENCH_DURATION || 30),
    rate = Number(process.env.TTL_OP_RATE || 2000),
    ttl = Number(process.env.TTL_KEY_TTL || 10)
  } = req.body || {};
  runTTL({ target, duration, rate, ttl }).catch(console.error);
  res.json({ status: 'started', target, duration, rate, ttl });
});

app.get('/healthz', (_req, res) => {
  res.status(200).type('text/plain').send('ok\n');
});

const port = 9400;
app.listen(port, '0.0.0.0', () => console.log(`Bench server listening on :${port}`));
