import axios from "axios";
import dayjs from "dayjs";

import DatabaseInstance from "./prisma.server";

const IMAGE_API_ENDPOINT =
  process.env.IMAGE_API_ENDPOINT || "http://127.0.0.1:3001";

const API_TOKEN = process.env.IMAGE_UPLOAD_TOKEN || "";

export class ImageService {
  async uploadImage(image: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", image);

    const response = await axios.post<{
      data: string;
    }>(`${IMAGE_API_ENDPOINT}/upload`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    return `${IMAGE_API_ENDPOINT}/images/${response.data.data}`;
  }

  async insertImageToDB(payload: {
    url: string;
    userID: number;
    type: number;
  }): Promise<void> {
    await DatabaseInstance.image.create({
      data: {
        url: payload.url,
        user_id: payload.userID,
        type: payload.type,
        created_at: dayjs().unix(),
      },
    });
  }

  async getUserResumeAvatar(
    userID: number,
  ): Promise<{ id: number; url: string }[]> {
    const images = await DatabaseInstance.image.findMany({
      select: {
        id: true,
        url: true,
      },
      where: {
        user_id: userID,
        type: 2,
      },
    });

    return images;
  }

  async getImageByID(
    id: number,
  ): Promise<{ userID: number; url: string; type: number }> {
    const image = await DatabaseInstance.image.findUnique({
      select: {
        url: true,
        user_id: true,
        type: true,
      },
      where: {
        id,
      },
    });

    if (!image) {
      throw new Error("图片不存在");
    }

    return {
      userID: image.user_id,
      url: image.url,
      type: image.type,
    };
  }
}
