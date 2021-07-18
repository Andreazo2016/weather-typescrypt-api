import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';

export interface PayloadAuth {
  id: string;
  name: string;
}

export default class AuthService {
  public static hashPassword(password: string, salt = 10): Promise<string> {
    return bcrypt.hash(password, salt)
  }

  public static comparePasswords(password: string, hashedPassword: string,): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  public static generateToken(payload: PayloadAuth): string {
    const secretKey = config.get('App.auth.secretKey') as string
    const expiresIn = config.get('App.auth.expiresIn') as string
    return jwt.sign(payload, secretKey, {
      expiresIn
    })
  }
}