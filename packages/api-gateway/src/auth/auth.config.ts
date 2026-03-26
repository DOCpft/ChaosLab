export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export default (): { jwt: JwtConfig } => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
     expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});