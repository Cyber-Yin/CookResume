"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import ImageEditor from "@/components/ImageEditor";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";

const AvatarSetting: React.FC<{
  index: number;
  avatar: string;
  userName: string;
}> = ({ index, avatar, userName }) => {
  const [avatarURL, setAvatarURL] = useState(avatar);

  return (
    <motion.div
      variants={FADE_IN_ANIMATION}
      custom={index}
      initial="hidden"
      animate="visible"
      className="flex justify-between rounded-lg border border-custom bg-custom p-6"
    >
      <div className="space-y-2">
        <div className="text-xl font-semibold">头像</div>
        <div className="text-sm text-custom-secondary">点击头像从文件上传</div>
      </div>
      <ImageEditor
        aspect={1 / 1}
        uploadAction="update_account_avatar"
        onUploadSuccess={(url) => {
          setAvatarURL(url);
        }}
      >
        <Avatar className="h-16 w-16 hover:cursor-pointer">
          <AvatarImage src={avatarURL || ""} />
          <AvatarFallback>{userName.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </ImageEditor>
    </motion.div>
  );
};

export default AvatarSetting;
