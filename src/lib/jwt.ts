import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

/**
 * Sign a JWT token with user information
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 * Note: This function uses jsonwebtoken which may not work in edge runtime
 * For edge runtime, use decodeTokenEdgeRuntime instead
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode JWT token for edge runtime (middleware)
 * This decodes without verification - verification is done on API routes
 * For production, consider using a proper JWT library that supports edge
 */
export function decodeTokenEdgeRuntime(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    ) as TokenPayload;

    // Check expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}
