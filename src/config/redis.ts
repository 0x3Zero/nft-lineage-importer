import { createClient } from 'redis';

const redisClient = createClient();

async function init() {
  new Promise((resolve, reject) => {
    redisClient.on('connect', () => {
      console.log('redis client connected');
      resolve(redisClient);
    });

    redisClient.on('error', (error: any) => {
      reject(error);
    });
  });
  await redisClient.connect();
}

export { init, redisClient };
