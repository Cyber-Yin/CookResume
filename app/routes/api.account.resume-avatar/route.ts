import { LoaderFunction, json } from "@remix-run/node";

import { ImageService } from "@/lib/services/image.server";
import { UserService } from "@/lib/services/user.server";
import { formatError } from "@/lib/utils";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const userService = new UserService();

    const userID = await userService.getUserIDByCookie(request);

    if (!userID) {
      throw new Error("用户未登录");
    }

    const imageService = new ImageService();

    const images = await imageService.getUserResumeAvatar(userID);

    return json({
      data: images,
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
