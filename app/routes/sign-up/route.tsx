import { Button } from "@nextui-org/react";
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { motion } from "framer-motion";
import { sha256 } from "js-sha256";
import { useMemo, useState } from "react";
import { z } from "zod";

import CustomCheckbox from "@/components/CustomCheckbox";
import CustomInput from "@/components/CustomInput";
import { useToast } from "@/components/Toaster/hooks";
import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import {
  cn,
  formatError,
  generateRandomSalt,
  validateEmail,
  validatePayload,
} from "@/lib/utils";

const RequestSchema = z.object({
  userName: z
    .string()
    .min(3)
    .max(12)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const user = await DatabaseInstance.user.findFirst({
      select: {
        id: true,
      },
      where: {
        OR: [
          {
            user_name: data.userName,
          },
          {
            email: data.email,
          },
        ],
      },
    });

    if (user) {
      throw new Error("该账号已被注册");
    }

    const salt = generateRandomSalt();

    await DatabaseInstance.user.create({
      data: {
        user_name: data.userName,
        email: data.email,
        password: sha256(data.password + salt),
        salt,
        verified: 0,
      },
    });

    return json({
      success: true,
    });
  } catch (e) {
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

export const loader: LoaderFunction = async ({ request }) => {
  const { isLogin } = await checkUserIsLogin(request);

  if (isLogin) {
    return redirect("/dashboard");
  }

  return json({});
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    data: {
      userName: "",
      email: "",
      password: "",
      readPolicy: false,
    },
    error: {
      userName: "",
      email: "",
      password: "",
      readPolicy: "",
    },
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [step, setStep] = useState<"complete" | "wait">("wait");

  const passwordSecurity = useMemo(() => {
    const password = formState.data.password;

    if (!password) {
      return 0;
    }

    if (password.length < 8) {
      return 1;
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);

    const strength = [hasLetters, hasNumbers, hasSpecialChars].filter(
      Boolean,
    ).length;

    return strength;
  }, [formState.data.password]);

  const canRegister = useMemo(() => {
    const errorArray = Object.values(formState.error);

    return errorArray.every((error) => !error);
  }, [formState.error]);

  const register = async () => {
    let success = true;

    if (!formState.data.userName) {
      setFormState((prev) => ({
        data: prev.data,
        error: {
          ...prev.error,
          userName: "用户名不能为空",
        },
      }));

      success = false;
    } else if (
      formState.data.userName.length < 3 ||
      formState.data.userName.length > 12
    ) {
      setFormState((prev) => ({
        data: prev.data,
        error: {
          ...prev.error,
          userName: "用户名长度必须在 3-12 位之间",
        },
      }));

      success = false;
    } else {
      const regCheck = formState.data.userName.match(/^[a-zA-Z][a-zA-Z0-9_]*$/);

      if (!regCheck) {
        setFormState((prev) => ({
          data: prev.data,
          error: {
            ...prev.error,
            userName: "用户名格式错误",
          },
        }));

        success = false;
      }
    }

    if (!formState.data.email) {
      setFormState((prev) => ({
        data: prev.data,
        error: {
          ...prev.error,
          email: "邮箱不能为空",
        },
      }));

      success = false;
    } else {
      const regCheck = validateEmail(formState.data.email);

      if (!regCheck) {
        setFormState((prev) => ({
          data: prev.data,
          error: {
            ...prev.error,
            email: "邮箱格式错误",
          },
        }));

        success = false;
      }
    }

    if (passwordSecurity < 2) {
      setFormState((prev) => ({
        data: prev.data,
        error: {
          ...prev.error,
          password: "密码强度不足",
        },
      }));

      success = false;
    }

    if (!formState.data.readPolicy) {
      setFormState((prev) => ({
        data: prev.data,
        error: {
          ...prev.error,
          readPolicy: "请阅读并同意《隐私协议》",
        },
      }));

      success = false;
    }

    if (!success) {
      return;
    }

    try {
      setRegisterLoading(true);

      await axios.post("/sign-up", {
        userName: formState.data.userName,
        email: formState.data.email,
        password: sha256(formState.data.password),
      });

      setStep("complete");
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
        registered: boolean;
      }>("/api/check-register", {
        type,
        value: formState.data[type === "username" ? "userName" : "email"],
      });

      if (resp.data.registered) {
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
    <div className="mx-auto flex h-screen min-h-screen w-full items-center sm:h-auto sm:w-[500px] sm:py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full w-full flex-col items-center justify-center space-y-12 bg-custom px-4 py-16 sm:h-auto sm:rounded-lg sm:border-t-4 sm:border-t-primary-400 sm:shadow-lg"
      >
        {step === "wait" && (
          <>
            <h1 className="text-2xl font-bold">注册账号</h1>
            <div className="w-full space-y-4 sm:max-w-[360px]">
              <div className="w-full space-y-8">
                <CustomInput
                  props={{
                    value: formState.data.userName,
                    onValueChange: (value) => {
                      setFormState((prev) => ({
                        data: {
                          ...prev.data,
                          userName: value,
                        },
                        error: {
                          ...prev.error,
                          userName: "",
                        },
                      }));
                    },
                    label: "用户名",
                    placeholder: "请输入用户名",
                    type: "text",
                    isClearable: true,
                    isInvalid: !!formState.error.userName,
                    errorMessage: formState.error.userName,
                    onBlur: () => checkRegisterUsernameAndEmail("username"),
                    description:
                      "3-12 位，支持大小写字母、数字和下划线，不能以数字或下划线开头",
                  }}
                />
                <CustomInput
                  props={{
                    value: formState.data.email,
                    onValueChange: (value) => {
                      setFormState((prev) => ({
                        data: {
                          ...prev.data,
                          email: value,
                        },
                        error: {
                          ...prev.error,
                          email: "",
                        },
                      }));
                    },
                    label: "邮箱",
                    placeholder: "请输入邮箱",
                    type: "email",
                    isClearable: true,
                    isInvalid: !!formState.error.email,
                    errorMessage: formState.error.email,
                    onBlur: () => checkRegisterUsernameAndEmail("email"),
                  }}
                />
                <div className="w-full space-y-2">
                  <CustomInput
                    props={{
                      value: formState.data.password,
                      onValueChange: (value) => {
                        setFormState((prev) => ({
                          data: {
                            ...prev.data,
                            password: value,
                          },
                          error: {
                            ...prev.error,
                            password: "",
                          },
                        }));
                      },
                      label: "密码",
                      placeholder: "请输入密码",
                      type: passwordVisible ? "text" : "password",
                      isInvalid: !!formState.error.password,
                      errorMessage: formState.error.password,
                      endContent: (
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() => setPasswordVisible((prev) => !prev)}
                        >
                          {passwordVisible ? (
                            <img
                              className="h-5 w-5 text-foreground opacity-70 transition-opacity hover:opacity-100"
                              src="/icons/eye-off.svg"
                            />
                          ) : (
                            <img
                              className="h-5 w-5 text-foreground opacity-70 transition-opacity hover:opacity-100"
                              src="/icons/eye.svg"
                            />
                          )}
                        </button>
                      ),
                      description: "至少 8 位，必须同时包含字母和数字",
                    }}
                  />
                  <div
                    className={cn(
                      "flex w-full items-center space-x-4 rounded-lg border-1.5 px-4 py-2",
                      {
                        "border-red-500": passwordSecurity < 2,
                        "border-yellow-500": passwordSecurity === 2,
                        "border-green-500": passwordSecurity === 3,
                      },
                    )}
                  >
                    <div className="grid grow grid-cols-3 gap-2">
                      <div
                        className={cn("h-1.5 w-full rounded-lg", {
                          "bg-default-200": passwordSecurity === 0,
                          "bg-red-500": passwordSecurity === 1,
                          "bg-yellow-500": passwordSecurity === 2,
                          "bg-green-500": passwordSecurity === 3,
                        })}
                      ></div>
                      <div
                        className={cn("h-1.5 w-full rounded-lg", {
                          "bg-default-200": passwordSecurity < 2,
                          "bg-yellow-500": passwordSecurity === 2,
                          "bg-green-500": passwordSecurity === 3,
                        })}
                      ></div>
                      <div
                        className={cn("h-1.5 w-full rounded-lg", {
                          "bg-default-200": passwordSecurity < 3,
                          "bg-green-500": passwordSecurity === 3,
                        })}
                      ></div>
                    </div>
                    <div
                      className={cn("text-sm font-semibold", {
                        "text-red-500": passwordSecurity < 2,
                        "text-yellow-500": passwordSecurity === 2,
                        "text-green-500": passwordSecurity === 3,
                      })}
                    >
                      {passwordSecurity < 2
                        ? "弱"
                        : passwordSecurity === 2
                          ? "中"
                          : "强"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <CustomCheckbox
                  props={{
                    isSelected: formState.data.readPolicy,
                    onValueChange: (isSelected) => {
                      setFormState((prev) => ({
                        data: {
                          ...prev.data,
                          readPolicy: isSelected,
                        },
                        error: {
                          ...prev.error,
                          readPolicy: "",
                        },
                      }));
                    },
                    isInvalid: !!formState.error.readPolicy,
                  }}
                >
                  我已阅读
                </CustomCheckbox>
                <span className="cursor-pointer select-none text-small font-semibold text-primary-400">
                  《隐私协议》
                </span>
              </div>

              <div className="flex w-full flex-col items-center space-y-2">
                <Button
                  isDisabled={registerLoading || !canRegister}
                  className="w-full sm:max-w-[360px]"
                  radius="sm"
                  color="primary"
                  onClick={() => register()}
                  isLoading={registerLoading}
                >
                  注册
                </Button>
              </div>
            </div>
          </>
        )}
        {step === "complete" && (
          <div className="flex w-full flex-col items-center space-y-6">
            <h1 className="text-2xl font-bold">注册成功</h1>
            <motion.svg
              className="h-16 w-16"
              viewBox="0 0 100 100"
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="#22c55e"
                strokeWidth="7"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.path
                d="M30 50 L45 65 L70 35"
                stroke="#22c55e"
                strokeWidth="7"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />
            </motion.svg>
            <div className="text-center text-sm">
              注册成功，点击确认返回登录页
            </div>
            <Button
              className="w-40"
              radius="sm"
              color="primary"
              onClick={() => navigate("/sign-in")}
            >
              确认
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
