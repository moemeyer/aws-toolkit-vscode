import { Queue } from "bullmq";

export const forwardQueue = new Queue("forward-events", {
  connection: { url: process.env.REDIS_URL }
});
