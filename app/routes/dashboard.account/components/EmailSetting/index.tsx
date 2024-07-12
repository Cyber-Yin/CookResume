import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { FormInput } from "@/components/Input";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";

const EmailSetting: React.FC<{
  index: number;
  email: string;
  verified: boolean;
}> = ({ index, email, verified }) => {
  const [formState, setFormState] = useState("");
  const [hideVerify, setHideVerify] = useState(false);

  useEffect(() => {
    setFormState(email);
  }, [email]);

  return (
    <motion.div
      variants={FADE_IN_ANIMATION}
      custom={index}
      initial="hidden"
      animate="visible"
      className="space-y-4 rounded-lg border border-custom bg-custom p-6"
    >
      <div className="space-y-2">
        <div className="text-xl font-semibold">邮箱</div>
        <div className="text-sm text-custom-secondary">
          邮箱可用于登录酷客简历
        </div>
      </div>
      <div className="flex w-full flex-col space-x-0 space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
        <div className="w-[300px]">
          <FormInput
            type="email"
            label="邮箱"
            placeholder="quickresume@gmail.com"
            labelHidden
            value={formState}
            onValueChange={(v) => {
              setFormState(v);
              setHideVerify(true);
            }}
          />
        </div>
        {!verified && !hideVerify && (
          <div className="flex items-center space-x-1">
            <Info className="h-4 w-4 text-danger-light" />
            <div className="cursor-pointer text-sm text-danger-light hover:underline">
              邮箱未验证，点此验证
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full justify-end">
        <Button variant="outline">保存</Button>
      </div>
    </motion.div>
  );
};

export default EmailSetting;
