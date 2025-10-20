import Redis from 'ioredis';
import crypto from 'crypto';
import { benchCounters } from './server.js';

export async function runPubSub({ target, duration, rate, msgSize }) {
  const publisher = new Redis(target);
  const subscriber = new Redis(target);
  const channel = `bench:pubsub:${Date.now()}`;
  const endAt = Date.now() + duration * 1000;
  const payload = crypto.randomBytes(Math.max(1, msgSize)).toString('hex').slice(0, msgSize);
  const targetLabel = target;

  await subscriber.subscribe(channel);
  subscriber.on('message', () => benchCounters.pubsubReceived.labels(targetLabel).inc());

  let timer = null;
  const tick = async () => {
    const perTick = Math.max(1, Math.floor(rate / 10)); // 10 ticks/sec
    for (let i = 0; i < perTick; i++) {
      publisher.publish(channel, payload);
      benchCounters.pubsubPublished.labels(targetLabel).inc();
    }
    if (Date.now() < endAt) timer = setTimeout(tick, 100);
    else { clearTimeout(timer); await publisher.quit(); await subscriber.quit(); }
  };
  tick();
}
