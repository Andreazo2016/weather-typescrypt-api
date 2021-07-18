import AuthService from '@src/services/auth';
import { Request, Response, NextFunction } from 'express';
export function authMiddleware(req: Partial<Request>, res: Partial<Response>, next: NextFunction): void {
  const token = req.headers?.authorization

  if (!token) {
    res.status?.(401).send({
      code: 401,
      error: 'jwt malformed'
    })
  }
  try {
    const decoded = AuthService.decodeToken(token as string);
    req.user = decoded
    next()
  } catch (error) {
    res.status?.(401).send({
      code: 401,
      error: 'jwt must be provided'
    })
  }
}