import { ActionFunction, json } from "@remix-run/node";
import { createHash } from "crypto";
import { createTransport } from "nodemailer";
import { z } from "zod";

import { SMTP_PASS, SMTP_USER } from "@/lib/const/email.server";
import { RedisKeyGenerator } from "@/lib/const/redis-key";
import RedisInstance from "@/lib/services/redis.server";
import { UserService } from "@/lib/services/user.server";
import {
  formatError,
  generateVerificationCode,
  validatePayload,
} from "@/lib/utils";

const RequestSchema = z.object({
  type: z.enum(["forgotPassword", "signUp", "changeEmail", "changePassword"]),
  email: z.string().email().optional(),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    let email = "";
    let userID = 0;

    const userService = new UserService();

    if (["signUp", "forgotPassword"].includes(data.type)) {
      email = data.email || "";
    } else {
      await userService.autoSignInByCookie(request);

      if (data.type === "changeEmail") {
        email = data.email || "";
      } else {
        email = userService.user!.email;
      }

      userID = userService.user!.id;
    }

    if (!email) {
      throw new Error("邮箱不能为空");
    }

    const emailMD5 = createHash("md5").update(email).digest("hex");

    const emailInterval = await RedisInstance.get(
      RedisKeyGenerator.generateEmailIntervalKey(emailMD5),
    );

    if (emailInterval) {
      throw new Error("请勿频繁请求");
    }

    const transporter = createTransport({
      host: "smtp.feishu.cn",
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
      to: email,
      subject: "酷客简历验证码",
      html: `<p>您的验证码是：${verificationCode}</p>
      <p>如果您没有进行此操作，请忽略此邮件。</p>
      <p>验证码有效期为 5 分钟。</p>
      <p>该邮件由系统自动发出，请勿回复此邮件。</p>
      `,
    };

    const content: {
      type: string;
      email: string;
    } = {
      type: data.type,
      email,
    };

    await transporter.sendMail(mailOptions);

    await RedisInstance.multi()
      .set(
        RedisKeyGenerator.generateEmailIntervalKey(emailMD5),
        "true",
        "EX",
        30,
        "NX",
      )
      .set(
        RedisKeyGenerator.generateVerificationCode(verificationCode),
        JSON.stringify(content),
        "EX",
        60 * 5,
      )
      .exec();

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
