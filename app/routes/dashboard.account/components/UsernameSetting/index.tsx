import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { FormInput } from "@/components/Input";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";

const UsernameSetting: React.FC<{
  index: number;
  userName: string;
}> = ({ index, userName }) => {
  const [formState, setFormState] = useState("");

  useEffect(() => {
    setFormState(userName);
  }, [userName]);

  return (
    <motion.div
      variants={FADE_IN_ANIMATION}
      custom={index}
      initial="hidden"
      animate="visible"
      className="space-y-4 rounded-lg border border-custom bg-custom p-6"
    >
      <div className="space-y-2">
        <div className="text-xl font-semibold">用户名</div>
        <div className="text-sm text-custom-secondary">
          请输入用户名，3-12
          位，支持大小写字母、数字和下划线，不能以数字或下划线开头
        </div>
      </div>
      <div className="w-[300px]">
        <FormInput
          label="用户名"
          placeholder="QuickResume"
          labelHidden
          value={formState}
          onValueChange={(v) => setFormState(v)}
        />
      </div>

      <div className="flex w-full justify-end">
        <Button variant="outline">保存</Button>
      </div>
    </motion.div>
  );
};

export default UsernameSetting;
