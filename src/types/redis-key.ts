export enum Key {
  BLOGS_LATEST = 'BLOGS_LATEST',
}

export enum RK {
  NODE = 'node',
}

export type DynamicKeyType = `${RK}:${string}`;

export function getDynamicKey(key: RK, suffix: string) {
  const dynamic: DynamicKeyType = `${key}:${suffix}`;
  return dynamic;
}
