import { motion } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";

const AvatarSetting: React.FC<{
  index: number;
  avatar: string | null;
  userName: string;
}> = ({ index, avatar, userName }) => {
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
      <Avatar className="h-16 w-16 hover:cursor-pointer">
        <AvatarImage src={avatar || ""} />
        <AvatarFallback>{userName.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
    </motion.div>
  );
};

export default AvatarSetting;
