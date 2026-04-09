import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { redis } from "./config/redis.js";
import { logger } from "./utils/logger.js";

const port = Number(env.PORT);

const start = async () => {
  try {
    await prisma.$connect();
    await redis.ping();
    app.listen(port, () => logger.info(`Server running on ${port}`));
  } catch (error) {
    logger.error({ message: "startup failed", error });
    process.exit(1);
  }
};

start();
