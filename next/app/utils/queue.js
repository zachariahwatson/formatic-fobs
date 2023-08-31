import { Queue } from "bullmq"

export const printQueue = new Queue('print-queue', { connection: {
    host: 'localhost',
    port: 6379
  }})