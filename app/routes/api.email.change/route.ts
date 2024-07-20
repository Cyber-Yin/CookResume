import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { EmailService } from "@/lib/services/email.server";
import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  verification_code: z.string().length(6),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    const emailService = new EmailService();

    const verificationContent = await emailService.getVerificationContentByCode(
      data.verification_code,
    );

    if (verificationContent.type !== "changeEmail") {
      throw new Error("验证码类型错误");
    }

    if (userService.user!.email === verificationContent.email) {
      throw new Error("新邮箱与旧邮箱一致");
    }

    await userService.updateUserInfo({
      email: verificationContent.email,
    });

    await emailService.deleteVerificationCodeCache(data.verification_code);

    return json({
      data: {
        email: verificationContent.email,
      },
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
