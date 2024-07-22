import axios from "axios";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { FormInput } from "@/components/Input";
import { useToast } from "@/components/Toaster/hooks";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";
import { formatError } from "@/lib/utils";
import { FormValidator } from "@/lib/utils/form-validator";

const UsernameSetting: React.FC<{
  index: number;
  userName: string;
}> = ({ index, userName }) => {
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    data: userName,
    error: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);

      try {
        FormValidator.userNameValidator(formState.data);
      } catch (e) {
        setFormState((prev) => ({
          ...prev,
          error: formatError(e),
        }));
        return;
      }

      await axios.post("/api/account/update", {
        action: "updateUsername",
        user_name: formState.data,
      });

      toast({
        title: "更新用户名成功",
      });
    } catch (e) {
      toast({
        title: "更新资料失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

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
      <div className="w-full max-w-[300px]">
        <FormInput
          placeholder="CookResume"
          error={formState.error}
          value={formState.data}
          onValueChange={(v, e) =>
            setFormState({
              data: v,
              error: e,
            })
          }
        />
      </div>

      <div className="flex w-full justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitLoading || !!formState.error}
        >
          {submitLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "保存"
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default UsernameSetting;
