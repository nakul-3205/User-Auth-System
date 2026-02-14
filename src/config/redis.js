import Redis from "ioredis";
import { logger } from "../utils/logger.js";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
    logger.error(" Redis URL not found. Environment variables are missing.");
    process.exit(1);
}

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3, 
});

redis.on("connect", () => {
    logger.info(" Redis: Attempting to connect...");
});

redis.on("ready", () => {
    logger.info(" Redis: Connection established and ready to use.");
});

redis.on("error", (err) => {
    logger.error({ err }, " Redis: Connection Error");
});

try {
    await redis.set("connection_test", "ok", "EX", 10);
    const test = await redis.get("connection_test");
    if (test === "ok") {
        logger.info(" Redis: Handshake test successful.");
    }
} catch (err) {
    logger.error({ err }, " Redis: Handshake test failed.");
    process.exit(1); 
}

export default redis;