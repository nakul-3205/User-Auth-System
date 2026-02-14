import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.js";

class KafkaConfig {
    constructor() {
        this.kafka = null;
        this.producer = null;
    }

    async init() {
        const isProduction = process.env.NODE_ENV?.toLowerCase() === "production";
        const certDir = isProduction ? "/tmp/certs" : path.resolve("cert");

        try {
            if (isProduction) {
                if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
                fs.writeFileSync(path.join(certDir, "ca.pem"), process.env.KAFKA_CA_CERT.replace(/\\n/g, '\n'));
                fs.writeFileSync(path.join(certDir, "service.cert"), process.env.KAFKA_SERVICE_CERT.replace(/\\n/g, '\n'));
                fs.writeFileSync(path.join(certDir, "service.key"), process.env.KAFKA_SERVICE_KEY.replace(/\\n/g, '\n'));
            }

            const caPath = path.join(certDir, "ca.pem");
            const keyPath = path.join(certDir, "service.key");
            const certPath = path.join(certDir, "service.cert");

            if (!fs.existsSync(caPath)) {
                throw new Error(`SSL files not found in ${certDir}.`);
            }

            this.kafka = new Kafka({
                clientId: "auth-service",
                brokers: [process.env.KAFKA_BROKER],
                ssl: {
                    rejectUnauthorized: true,
                    ca: [fs.readFileSync(caPath)],
                    key: fs.readFileSync(keyPath),
                    cert: fs.readFileSync(certPath),
                },
                // --- NETWORK RESILIENCE SETTINGS ---
                connectionTimeout: 10000,   // Wait 10s for initial connection
                authenticationTimeout: 10000, // Wait 10s for SSL handshake
                retry: {
                    initialRetryTime: 1000,  // Wait 1s between retries
                    retries: 10              
                }
            });

            logger.info("Kafka: Client initialized successfully via SSL files.");
        } catch (err) {
            logger.error({ err: err.message }, "Kafka: SSL Configuration Failure");
            throw err;
        }
    }

    async connectProducer() {
        if (!this.kafka) await this.init();
        
        // Silence the partitioner warning here
        this.producer = this.kafka.producer({
            idempotent: true,
            createPartitioner: () => (({ message }) => 0) 
        });

        try {
            await this.producer.connect();
            logger.info("Kafka: Producer connected successfully.");
        } catch (err) {
            logger.error({ err: err.message }, "Kafka: Producer connection failed.");
            throw err;
        }
    }

    async sendEvent(topic, message) {
        if (!this.producer) throw new Error("Producer not connected");
        await this.producer.send({
            topic,
            messages: [{ key: message.email, value: JSON.stringify(message) }],
        });
    }
}

const kafkaInstance = new KafkaConfig();
export default kafkaInstance;