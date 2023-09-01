import pkg from 'bcryptjs';
const { compare, genSalt, hash } = pkg;
const ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  const salt = await genSalt(ROUNDS);
  return hash(password, salt);
}

export async function comparePassword(providedPass: string, storedPass: string): Promise<boolean> {
  const passwordIsMatched = await compare(providedPass, storedPass);
  return passwordIsMatched;
}
