export const RedisKeyGenerator = {
  generateEmailIntervalKey: (userId: number) => `user:${userId}:email_interval`,
  generateVerificationCode: (code: string) => `verification_code:${code}`,
  generateUserToken: (userId: number) => `user:${userId}:token`,
};
