import { Response, NextFunction, Request } from 'express';
import { redisClient } from '../config/redis';
import { isJSON } from '../utils';
import { RK, getDynamicKey, DynamicKeyType } from '../types';
import { logCache } from './logging.middleware';

export enum REDIS_TYPES {
  LIST = 'list',
  STRING = 'string',
  HASH = 'hash',
  ZSET = 'zset',
  SET = 'set',
}

function getCache(redisKeyEnum: RK | DynamicKeyType) {
  return async function (req: Request, res: Response, next: NextFunction) {
    let id = req.params?.id;
    const key = Boolean(id) ? getDynamicKey(redisKeyEnum as RK, id) : redisKeyEnum;

    let data = await redisClient.get(key);

    if (data) {
      if (isJSON(data)) data = JSON.parse(data);
      res.status(200).send(data);
      logCache('HIT', key);
    } else {
      logCache('MISS', key);
      next();
    }
  };
}

async function getCacheValue(key: string) {
  let data = await redisClient.get(key);
  if (data) {
    if (isJSON(data)) data = JSON.parse(data);
    logCache('HIT', key);
    return data;
  } else {
    logCache('MISS', key);
    return null;
  }
}

async function setCache(key: string, value: string, expiresAt: number = 60 * 15) {
  await redisClient.set(key, value);
  await redisClient.expire(key, expiresAt);
}

async function invalidateCache(keys: string[]) {
  await redisClient.del(keys);
}

export { getCache, getCacheValue, setCache, invalidateCache };
