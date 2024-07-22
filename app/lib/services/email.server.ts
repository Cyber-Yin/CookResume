import { RedisKeyGenerator } from "../const/redis-key";
import RedisInstance from "./redis.server";

export class EmailService {
  async getVerificationContentByCode(code: string): Promise<{
    type: string;
    email: string;
  }> {
    const content = await RedisInstance.get(
      RedisKeyGenerator.generateVerificationCode(code),
    );

    if (!content) {
      throw new Error("验证码不存在或已过期");
    }

    const jsonContent = JSON.parse(content) as {
      type: string;
      email: string;
    };

    return jsonContent;
  }

  async deleteVerificationCodeCache(code: string): Promise<void> {
    await RedisInstance.del(RedisKeyGenerator.generateVerificationCode(code));
  }
}
