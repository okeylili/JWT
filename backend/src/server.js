import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { app } from "./app.js";

async function start() {
  await connectDb();
  app.listen(env.port, () => logger.info(`API listening on ${env.port}`));
}

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});
