export const RedisKeyGenerator = {
  generateEmailIntervalKey: (emailMD5: string) => `email_interval:${emailMD5}`,
  generateVerificationCode: (code: string) => `verification_code:${code}`,
  generateUserToken: (userId: number) => `user:${userId}:token`,
};
