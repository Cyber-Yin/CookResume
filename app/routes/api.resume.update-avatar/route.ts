import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { ImageService } from "@/lib/services/image.server";
import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  resume_id: z.number().int().min(1),
  avatar_id: z.number().int().min(0),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    const imageService = new ImageService();

    if (data.avatar_id === 0) {
      await userService.updateUserResume({
        id: data.resume_id,
        meta: {
          avatar: "",
        },
      });
    } else {
      const image = await imageService.getImageByID(data.avatar_id);

      if (image.userID !== userService.user!.id) {
        throw new Error("无权操作");
      }

      if (image.type !== 2) {
        throw new Error("图片类型错误");
      }

      await userService.updateUserResume({
        id: data.resume_id,
        meta: {
          avatar: image.url,
        },
      });
    }

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
