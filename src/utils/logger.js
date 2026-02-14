import pino from "pino";
import 'dotenv/config'; // Ensure envs are loaded here too

const targets = [
  // 1. Console
  {
    target: 'pino-pretty',
    level: 'info',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  // 2. Local File
  {
    target: 'pino/file',
    level: 'info',
    options: { 
      destination: './app.log',
      mkdir: true 
    },
  },
];

// 3. Add Better Stack ONLY if the token exists
if (process.env.BETTER_STACK_TOKEN) {
  targets.push({
    target: '@logtail/pino',
    level: 'info',
    options: { 
      sourceToken: process.env.BETTER_STACK_TOKEN,
    },
  });
} else {
  console.warn(" Better Stack Token missing. Cloud logging disabled.");
}

const transport = pino.transport({ targets });

export const logger = pino(transport);