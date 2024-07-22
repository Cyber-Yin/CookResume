import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { EmailService } from "@/lib/services/email.server";
import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  user_name: z
    .string()
    .min(3)
    .max(12)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  email: z.string().email(),
  verification_code: z.string().length(6),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const userService = new UserService();

    // 检查用户是否已注册
    const registered = await userService.checkUserIsRegister({
      name: data.user_name,
      email: data.email,
      both: true,
    });

    if (registered) {
      throw new Error("该账号已被注册");
    }

    // 注册邮箱验证码确认
    const emailService = new EmailService();

    const verificationContent = await emailService.getVerificationContentByCode(
      data.verification_code,
    );

    if (verificationContent.type !== "signUp") {
      throw new Error("验证码类型错误");
    }

    if (verificationContent.email !== data.email) {
      throw new Error("验证码邮箱与提交邮箱不符");
    }

    // 用户注册
    await userService.signUp({
      name: data.user_name,
      email: data.email,
      password: data.password,
    });

    // 删除验证码缓存
    await emailService.deleteVerificationCodeCache(data.verification_code);

    return json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    return json(
      {
        message: formatError(e),
      },
      {
        status: 400,
      },
    );
  }
};
