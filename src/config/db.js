import mongoose from "mongoose";
import {logger} from "../utils/logger.js"

class DatabaseConnection {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 5;
        this.retryInterval = 5000; // 5 seconds

        mongoose.set('strictQuery', true);

        // Connection Event Listeners
        mongoose.connection.on('connected', () => {
            logger.info('MongoDB: Connection established successfully.');
            this.retryCount = 0; 
        });

        mongoose.connection.on('error', (err) => {
            logger.error({ err }, 'MongoDB: Connection error occurred.');
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB: Connection lost. Checking status...');
        });
    }
     handleInitialRetry() {
    setTimeout(() => {
        logger.info("MongoDB: Attempting background reconnection...");
        this.connect();
    }, this.retryInterval);
}
    async connect() {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            logger.error("MONGODB_URI is missing in environment variables.");
            process.exit(1);
        }

        const options = {
            maxPoolSize: 50,        
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000, 
            family: 4              
        };

        try {
            await mongoose.connect(mongoUri, options);
        } catch (err) {
            this.retryCount++;
            logger.error(`MongoDB: Initial connection failed. Retry ${this.retryCount}/${this.maxRetries}`);
            
            if (this.retryCount < this.maxRetries) {
                setTimeout(() => this.connect(), this.retryInterval);
            } else {
                logger.error("MongoDB: Initial connection failed. API will stay alive, retrying in background...");
                this.handleInitialRetry();              
            }
        }
    }

    async disconnect() {
        try {
            await mongoose.connection.close();
            logger.info('MongoDB: Connection closed gracefully.');
        } catch (err) {
            logger.error({ err }, 'MongoDB: Error during graceful disconnection.');
        }
    }
}

const dbInstance = new DatabaseConnection();
export default dbInstance;