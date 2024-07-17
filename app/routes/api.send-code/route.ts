import { ActionFunction, json } from "@remix-run/node";
import { createTransport } from "nodemailer";
import { z } from "zod";

import { SMTP_PASS, SMTP_USER } from "@/lib/const/email.server";
import { RedisKeyGenerator } from "@/lib/const/redis-key";
import DatabaseInstance from "@/lib/services/prisma.server";
import RedisInstance from "@/lib/services/redis.server";
import {
  formatError,
  generateVerificationCode,
  validatePayload,
} from "@/lib/utils";

const RequestSchema = z.object({
  type: z.enum([
    "forgotPassword",
    "verifyEmail",
    "changeEmail",
    "changePassword",
  ]),
  user_email: z.string().email(),
  new_email: z.string().email().optional(),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    if (data.type === "changeEmail" && !data.new_email) {
      throw new Error("新邮箱不能为空");
    }

    const user = await DatabaseInstance.user.findUnique({
      select: {
        id: true,
        email: true,
        verified: true,
      },
      where: {
        email: data.user_email,
      },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    const emailInterval = await RedisInstance.get(
      RedisKeyGenerator.generateEmailIntervalKey(user.id),
    );

    if (emailInterval) {
      throw new Error("请勿频繁请求");
    }

    const transporter = createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const verificationCode = generateVerificationCode();

    const mailOptions = {
      from: SMTP_USER,
      to: data.type === "changeEmail" ? data.new_email : user.email,
      subject: "酷客简历验证码",
      html: `<p>您的验证码是：${verificationCode}</p>
      <p>如果您没有进行此操作，请忽略此邮件。</p>
      <p>验证码有效期为 5 分钟。</p>
      <p>该邮件由系统自动发出，请勿回复此邮件。</p>
      `,
    };

    const content: {
      type: string;
      user_id: number;
      email?: string;
    } = {
      type: data.type,
      user_id: user.id,
    };

    if (data.type === "changeEmail") {
      content.email = data.new_email;
    }

    await RedisInstance.multi()
      .set(
        RedisKeyGenerator.generateEmailIntervalKey(user.id),
        "true",
        "EX",
        60 * 1,
        "NX",
      )
      .set(
        RedisKeyGenerator.generateVerificationCode(verificationCode),
        JSON.stringify(content),
        "EX",
        60 * 5,
      )
      .exec();

    await transporter.sendMail(mailOptions);

    return json({
      message: "发送成功",
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
