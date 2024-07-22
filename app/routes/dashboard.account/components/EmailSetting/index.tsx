import axios from "axios";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer";
import { FormInput } from "@/components/Input";
import { ScrollArea } from "@/components/ScrollArea";
import { useToast } from "@/components/Toaster/hooks";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useSendCode } from "@/lib/hooks/useSendCode";
import { formatError } from "@/lib/utils";
import { FormValidator } from "@/lib/utils/form-validator";

const EmailSetting: React.FC<{
  index: number;
  email: string;
}> = ({ index, email }) => {
  const [changeEmailModalOpen, setChangeEmailModalOpen] = useState(false);
  const [emailValue, setEmailValue] = useState(email);

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
          邮箱可用于登录酷客简历和找回密码
        </div>
      </div>
      <div className="flex w-full flex-col space-x-0 space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
        <div className="flex h-10 w-full max-w-[300px] rounded-md border-[1.5px] border-custom-primary bg-custom-primary px-3 py-2 text-sm text-custom-secondary">
          {emailValue}
        </div>
      </div>
      <div className="flex w-full justify-end">
        <Button onClick={() => setChangeEmailModalOpen(true)}>更改</Button>
      </div>
      <ChangeEmailModal
        open={changeEmailModalOpen}
        onClose={() => setChangeEmailModalOpen(false)}
        onSubmit={(email) => setEmailValue(email)}
      />
    </motion.div>
  );
};

const ChangeEmailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}> = ({ open, onClose, onSubmit }) => {
  const { toast } = useToast();
  const { countdown, sendCode, isButtonDisabled, setCountdown } =
    useSendCode(90);
  const { isMobile } = useMediaQuery();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [formState, setFormState] = useState({
    data: {
      email: "",
      verificationCode: "",
    },
    error: {
      email: "",
      verificationCode: "",
    },
  });

  const clear = () => {
    setFormState({
      data: {
        email: "",
        verificationCode: "",
      },
      error: {
        email: "",
        verificationCode: "",
      },
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);

      let success = true;

      const validators = [
        {
          validator: () => FormValidator.emailValidator(formState.data.email),
          field: "email",
        },
        {
          validator: () =>
            FormValidator.verificationCodeValidator(
              formState.data.verificationCode,
            ),
          field: "verificationCode",
        },
      ];

      validators.forEach((validator) => {
        try {
          validator.validator();
        } catch (e) {
          setFormState((prev) => ({
            ...prev,
            error: { ...prev.error, [validator.field]: formatError(e) },
          }));
          success = false;
        }
      });

      if (!success) {
        return;
      }

      await axios.post("/api/email/change", {
        verification_code: formState.data.verificationCode,
      });

      onSubmit(formState.data.email);
      onClose();
      clear();
      setCountdown(0);
      toast({
        title: "更新邮箱成功",
      });
    } catch (e) {
      toast({
        title: "更新邮箱失败",
        description: formatError(e),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const canSubmit = useMemo(() => {
    const errorArray = Object.values(formState.error);

    return errorArray.every((error) => !error);
  }, [formState.error]);

  if (isMobile) {
    return (
      <Drawer open={open}>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader>
            <DrawerTitle>更改邮箱</DrawerTitle>
            <VisuallyHidden asChild>
              <DrawerDescription></DrawerDescription>
            </VisuallyHidden>
          </DrawerHeader>
          <ScrollArea className="w-full py-4">
            <div className="w-full space-y-4">
              <FormInput
                value={formState.data.email}
                error={formState.error.email}
                onValueChange={(v, e) => {
                  setFormState((prev) => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      email: v,
                    },
                    error: {
                      ...prev.error,
                      email: e,
                    },
                  }));
                }}
                label="新邮箱"
              />
              <div className="flex items-end space-x-2">
                <FormInput
                  className="grow"
                  label="验证码"
                  value={formState.data.verificationCode}
                  error={formState.error.verificationCode}
                  type="number"
                  onValueChange={(v, e) => {
                    setFormState((prev) => ({
                      data: {
                        ...prev.data,
                        verificationCode: v,
                      },
                      error: {
                        ...prev.error,
                        verificationCode: e,
                      },
                    }));
                  }}
                />
                <Button
                  disabled={isButtonDisabled}
                  onClick={() => {
                    try {
                      FormValidator.emailValidator(formState.data.email);
                    } catch (e) {
                      setFormState((prev) => ({
                        ...prev,
                        error: { ...prev.error, email: formatError(e) },
                      }));
                      return;
                    }

                    sendCode({
                      type: "changeEmail",
                      email: formState.data.email,
                    });
                  }}
                  className={
                    formState.error.verificationCode
                      ? "-translate-y-[22px]"
                      : ""
                  }
                >
                  {countdown > 0 ? countdown : "获取验证码"}
                </Button>
              </div>
            </div>
          </ScrollArea>

          <div className="flex w-full flex-col items-center space-y-2">
            <Button
              className="w-full"
              disabled={submitLoading || !canSubmit}
              onClick={handleSubmit}
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "提交"
              )}
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              disabled={submitLoading}
              onClick={() => {
                onClose();
                clear();
              }}
            >
              取消
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>更改邮箱</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="w-full py-4">
          <div className="w-full space-y-4">
            <FormInput
              value={formState.data.email}
              error={formState.error.email}
              onValueChange={(v, e) => {
                setFormState((prev) => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    email: v,
                  },
                  error: {
                    ...prev.error,
                    email: e,
                  },
                }));
              }}
              label="新邮箱"
            />
            <div className="flex items-end space-x-2">
              <FormInput
                className="grow"
                label="验证码"
                value={formState.data.verificationCode}
                error={formState.error.verificationCode}
                type="number"
                onValueChange={(v, e) => {
                  setFormState((prev) => ({
                    data: {
                      ...prev.data,
                      verificationCode: v,
                    },
                    error: {
                      ...prev.error,
                      verificationCode: e,
                    },
                  }));
                }}
              />
              <Button
                disabled={isButtonDisabled}
                onClick={() => {
                  try {
                    FormValidator.emailValidator(formState.data.email);
                  } catch (e) {
                    setFormState((prev) => ({
                      ...prev,
                      error: { ...prev.error, email: formatError(e) },
                    }));
                    return;
                  }

                  sendCode({
                    type: "changeEmail",
                    email: formState.data.email,
                  });
                }}
                className={
                  formState.error.verificationCode ? "-translate-y-[22px]" : ""
                }
              >
                {countdown > 0 ? countdown : "获取验证码"}
              </Button>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={submitLoading}
            onClick={() => {
              onClose();
              clear();
            }}
          >
            取消
          </Button>
          <Button
            disabled={submitLoading || !canSubmit}
            onClick={handleSubmit}
          >
            {submitLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "提交"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSetting;
