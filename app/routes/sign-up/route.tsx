import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { sha256 } from "js-sha256";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { FormInput, PasswordInput } from "@/components/Input";
import { Label } from "@/components/Label";
import PageCard from "@/components/PageCard";
import PasswordTip from "@/components/PasswordTip";
import SuccessTip from "@/components/SuccessTip";
import { useToast } from "@/components/Toaster/hooks";
import { usePasswordSecurity } from "@/lib/hooks/usePasswordSecurity";
import { useSendCode } from "@/lib/hooks/useSendCode";
import { UserService } from "@/lib/services/user.server";
import { cn, formatError } from "@/lib/utils";
import { FormValidator } from "@/lib/utils/form-validator";

export const loader: LoaderFunction = async ({ request }) => {
  const userService = new UserService();

  const userID = await userService.getUserIDByCookie(request);

  if (userID) {
    return redirect("/dashboard");
  }

  return json({});
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { countdown, sendCode, isButtonDisabled } = useSendCode(90);

  const [formState, setFormState] = useState({
    data: {
      userName: "",
      email: "",
      verificationCode: "",
      password: "",
      passwordConfirm: "",
      readPolicy: false,
    },
    error: {
      userName: "",
      email: "",
      verificationCode: "",
      password: "",
      passwordConfirm: "",
      readPolicy: "",
    },
  });

  const [registerLoading, setRegisterLoading] = useState(false);

  const [step, setStep] = useState(1);

  const { passwordSecurity } = usePasswordSecurity(formState.data.password);

  const canSubmit = useMemo(() => {
    const errorArray = Object.values(formState.error);

    return errorArray.every((error) => !error);
  }, [formState.error]);

  const register = async () => {
    const validators = [
      {
        validator: () =>
          FormValidator.userNameValidator(formState.data.userName),
        field: "userName",
      },
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
      {
        validator: () =>
          FormValidator.readPolicyValidator(formState.data.readPolicy),
        field: "readPolicy",
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
      setRegisterLoading(true);

      await axios.post("/api/account/sign-up", {
        user_name: formState.data.userName,
        email: formState.data.email,
        verification_code: formState.data.verificationCode,
        password: sha256(formState.data.password),
      });

      setStep(2);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: formatError(e),
        duration: 5000,
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const checkRegisterUsernameAndEmail = async (type: "username" | "email") => {
    if (!formState.data[type === "username" ? "userName" : "email"]) {
      return;
    }

    try {
      const resp = await axios.post<{
        data: { registered: boolean };
      }>("/api/account/check-register", {
        type,
        value: formState.data[type === "username" ? "userName" : "email"],
      });

      if (resp.data.data.registered) {
        setFormState((prev) => ({
          data: prev.data,
          error: {
            ...prev.error,
            [type === "username" ? "userName" : "email"]: `${
              type === "username" ? "该用户名" : "该邮箱"
            }已被注册`,
          },
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <PageCard title={step === 1 ? "注册账号" : "注册成功"}>
      {step === 1 && (
        <>
          <div className="w-full space-y-6 sm:max-w-[360px]">
            <div className="w-full space-y-4">
              <FormInput
                label="用户名"
                placeholder="请输入用户名"
                description="3-12 位，支持大小写字母、数字和下划线，不能以数字或下划线开头"
                onBlur={() => checkRegisterUsernameAndEmail("username")}
                value={formState.data.userName}
                error={formState.error.userName}
                onValueChange={(v, e) => {
                  setFormState((prev) => ({
                    data: {
                      ...prev.data,
                      userName: v,
                    },
                    error: {
                      ...prev.error,
                      userName: e,
                    },
                  }));
                }}
              />
              <FormInput
                label="邮箱"
                placeholder="请输入邮箱"
                onBlur={() => checkRegisterUsernameAndEmail("email")}
                value={formState.data.email}
                error={formState.error.email}
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
                      type: "signUp",
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
              <PasswordInput
                label="密码"
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
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="readPolicy"
                  checked={formState.data.readPolicy}
                  onCheckedChange={(isChecked) => {
                    setFormState((prev) => ({
                      data: {
                        ...prev.data,
                        readPolicy: isChecked === false ? false : true,
                      },
                      error: {
                        ...prev.error,
                        readPolicy: "",
                      },
                    }));
                  }}
                  className={cn("cursor-pointer", {
                    "border-danger": formState.error.readPolicy,
                  })}
                />
                <Label
                  htmlFor="readPolicy"
                  className={cn("cursor-pointer", {
                    "text-custom": !formState.error.readPolicy,
                    "text-danger": formState.error.readPolicy,
                  })}
                >
                  我已阅读
                </Label>
              </div>
              <span className="cursor-pointer text-sm font-semibold text-primary">
                《隐私协议》
              </span>
            </div>
            <div className="flex w-full flex-col items-center space-y-2">
              <Button
                disabled={registerLoading || !canSubmit}
                className="w-full sm:max-w-[360px]"
                onClick={() => register()}
              >
                {registerLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "注册"
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      {step === 2 && (
        <div className="flex w-full flex-col items-center space-y-6">
          <SuccessTip />
          <div className="text-center text-sm">
            注册成功，点击确认返回登录页
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
