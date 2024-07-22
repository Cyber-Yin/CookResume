import { ActionFunction, json } from "@remix-run/node";

import { ImageService } from "@/lib/services/image.server";
import { UserService } from "@/lib/services/user.server";
import { formatError, varifyInt } from "@/lib/utils";

export const action: ActionFunction = async ({ request }) => {
  try {
    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const action = formData.get("action") as string;
    const rid = formData.get("rid") as string;

    let url = "";

    const imageService = new ImageService();

    if (action === "update_account_avatar") {
      url = await imageService.uploadImage(imageFile);

      await imageService.insertImageToDB({
        url,
        userID: userService.user!.id,
        type: 1,
      });

      await userService.updateUserInfo({
        avatar: url,
      });
    } else if (action === "update_resume_avatar") {
      if (!rid) {
        throw new Error("参数错误");
      }

      const intResumeID = parseInt(rid);

      try {
        varifyInt.parse(intResumeID);
      } catch (e) {
        throw new Error("参数错误");
      }

      url = await imageService.uploadImage(imageFile);

      await imageService.insertImageToDB({
        url,
        userID: userService.user!.id,
        type: 2,
      });
    } else {
      throw new Error("操作失败");
    }

    return json({
      data: {
        url,
      },
    });
  } catch (e) {
    console.log(e);
    return json({ message: formatError(e) }, { status: 500 });
  }
};
