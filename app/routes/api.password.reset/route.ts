import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { EmailService } from "@/lib/services/email.server";
import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
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

    const emailService = new EmailService();

    const verificationContent = await emailService.getVerificationContentByCode(
      data.verification_code,
    );

    if (
      !["forgotPassword", "changePassword"].includes(verificationContent.type)
    ) {
      throw new Error("验证码类型错误");
    }

    const userService = new UserService();

    await userService.resetUserPassword({
      email: verificationContent.email,
      password: data.password,
    });

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
