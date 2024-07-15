import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { sha256 } from "js-sha256";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { FormInput, PasswordInput } from "@/components/Input";
import PageCard from "@/components/PageCard";
import PasswordTip from "@/components/PasswordTip";
import SuccessTip from "@/components/SuccessTip";
import { useToast } from "@/components/Toaster/hooks";
import { usePasswordSecurity } from "@/lib/hooks/usePasswordSecurity";
import { useSendCode } from "@/lib/hooks/useSendCode";
import { checkUserIsLogin } from "@/lib/services/auth.server";
import { formatError } from "@/lib/utils";
import { FormValidator } from "@/lib/utils/form-validator";

export const loader: LoaderFunction = async ({ request }) => {
  const { isLogin } = await checkUserIsLogin(request);

  if (isLogin) {
    return redirect("/dashboard");
  }

  return json({});
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { countdown, sendCode, isButtonDisabled } = useSendCode(90);

  const [formState, setFormState] = useState({
    data: {
      email: "",
      verificationCode: "",
      password: "",
      passwordConfirm: "",
    },
    error: {
      email: "",
      verificationCode: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const [step, setStep] = useState(1);

  const { passwordSecurity } = usePasswordSecurity(formState.data.password);

  const canResetPassword = useMemo(() => {
    const errorArray = Object.values(formState.error);

    return errorArray.every((error) => !error);
  }, [formState.error]);

  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const checkRegisterUsernameAndEmail = async () => {
    if (!formState.data.email) {
      return;
    }

    try {
      const resp = await axios.post<{
        registered: boolean;
      }>("/api/account/check-register", {
        type: "email",
        value: formState.data.email,
      });

      if (!resp.data.registered) {
        setFormState((prev) => ({
          data: prev.data,
          error: {
            ...prev.error,
            email: "该邮箱未被注册",
          },
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async () => {
    const validators = [
      {
        validator: () =>
          FormValidator.verificationCodeValidator(
            formState.data.verificationCode,
          ),
        field: "verificationCode",
      },
      {
        validator: () =>
          FormValidator.passwordValidator(formState.data.password),
        field: "password",
      },
      {
        validator: () =>
          FormValidator.passwordConfirmValidator(
            formState.data.password,
            formState.data.passwordConfirm,
          ),
        field: "passwordConfirm",
      },
    ];

    let success = true;

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

    try {
      setResetPasswordLoading(true);

      await axios.post("/api/password/reset", {
        verification_code: formState.data.verificationCode,
        password: sha256(formState.data.password),
      });

      setStep(2);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "重置密码失败",
        description: formatError(e),
        duration: 5000,
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  return (
    <PageCard title={step === 1 ? "重置密码" : "重置成功"}>
      {step === 1 && (
        <div className="w-full space-y-6 sm:max-w-[360px]">
          <div className="w-full space-y-4">
            <FormInput
              label="邮箱"
              placeholder="请输入邮箱"
              value={formState.data.email}
              error={formState.error.email}
              type="email"
              onValueChange={(v, e) => {
                setFormState((prev) => ({
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
              onBlur={checkRegisterUsernameAndEmail}
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
                disabled={
                  isButtonDisabled ||
                  !formState.data.email ||
                  !!formState.error.email
                }
                onClick={() =>
                  sendCode({
                    type: "forgotPassword",
                    user_email: formState.data.email,
                  })
                }
              >
                {countdown > 0 ? countdown : "获取验证码"}
              </Button>
            </div>
            <PasswordInput
              label="新密码"
              placeholder="请输入密码"
              description="至少 8 位，必须同时包含字母和数字"
              value={formState.data.password}
              error={formState.error.password}
              onValueChange={(v, e) => {
                setFormState((prev) => ({
                  data: {
                    ...prev.data,
                    password: v,
                  },
                  error: {
                    ...prev.error,
                    password: e,
                  },
                }));
              }}
            />
            <PasswordTip passwordSecurity={passwordSecurity} />
            <PasswordInput
              label="确认密码"
              placeholder="请再次输入密码"
              value={formState.data.passwordConfirm}
              error={formState.error.passwordConfirm}
              onBlur={() => {
                if (
                  formState.data.password !== formState.data.passwordConfirm
                ) {
                  setFormState((prev) => ({
                    data: prev.data,
                    error: {
                      ...prev.error,
                      passwordConfirm: "两次输入的密码不一致",
                    },
                  }));
                }
              }}
              onValueChange={(v, e) => {
                setFormState((prev) => ({
                  data: {
                    ...prev.data,
                    passwordConfirm: v,
                  },
                  error: {
                    ...prev.error,
                    passwordConfirm: e,
                  },
                }));
              }}
            />
          </div>
          <Button
            disabled={!canResetPassword || resetPasswordLoading}
            className="w-full sm:max-w-[360px]"
            onClick={() => handleSubmit()}
          >
            {resetPasswordLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "重置密码"
            )}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex w-full flex-col items-center space-y-6">
          <SuccessTip />
          <div className="text-center text-sm">
            重置密码成功，点击确认返回登录页
          </div>
          <Button
            className="w-40"
            onClick={() => navigate("/sign-in")}
          >
            确认
          </Button>
        </div>
      )}
    </PageCard>
  );
}
