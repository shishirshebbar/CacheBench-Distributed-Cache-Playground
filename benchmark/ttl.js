import Redis from 'ioredis';
import crypto from 'crypto';
import { benchCounters } from './server.js';

export async function runTTL({ target, duration, rate, ttl }) {
  const r = new Redis(target);
  const endAt = Date.now() + duration * 1000;
  const targetLabel = target;

  let timer = null;
  const tick = async () => {
    const perTick = Math.max(1, Math.floor(rate / 10)); // 10 ticks/sec
    const pipeline = r.pipeline();
    for (let i = 0; i < perTick; i++) {
      const key = `bench:ttl:${crypto.randomBytes(8).toString('hex')}`;
      pipeline.set(key, '1', 'EX', ttl);
    }
    await pipeline.exec();
    benchCounters.ttlSets.labels(targetLabel).inc(perTick);

    if (Date.now() < endAt) timer = setTimeout(tick, 100);
    else { clearTimeout(timer); await r.quit(); }
  };
  tick();
}
