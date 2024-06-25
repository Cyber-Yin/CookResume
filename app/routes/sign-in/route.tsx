import { Button } from "@nextui-org/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json, useNavigate } from "@remix-run/react";
import axios from "axios";
import { motion } from "framer-motion";
import { sha256 } from "js-sha256";
import { useState } from "react";
import { z } from "zod";

import CustomCheckbox from "@/components/CustomCheckbox";
import CustomInput from "@/components/CustomInput";
import { useToast } from "@/components/Toaster/hooks";
import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import RedisInstance from "@/lib/services/redis.server";
import { createUserSession } from "@/lib/services/session.server";
import {
  formatError,
  generateRandomSalt,
  validateEmail,
  validatePayload,
  verifyPassword,
} from "@/lib/utils";

const RequestSchema = z.object({
  account: z.string().min(1),
  password: z.string().min(1),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const user = await DatabaseInstance.user.findUnique({
      select: {
        id: true,
        password: true,
        salt: true,
      },
      where: validateEmail(data.account)
        ? {
            email: data.account,
          }
        : {
            user_name: data.account,
          },
    });

    if (!user) {
      throw new Error("该用户不存在");
    }

    if (!verifyPassword(user.password, user.salt, data.password)) {
      throw new Error("用户账号或密码错误");
    }

    const salt = generateRandomSalt();

    await RedisInstance.set(
      `user:${user.id}:token`,
      salt,
      "EX",
      60 * 60 * 24 * 7,
    );

    return createUserSession(user.id, salt);
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

export default function SignInPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    data: {
      account: "",
      password: "",
      rememberMe: false,
    },
    error: {
      account: "",
      password: "",
      rememberMe: "",
    },
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const login = async () => {
    if (!formState.data.account) {
      setFormState((prev) => ({
        data: prev.data,
        error: {
          ...prev.error,
          account: "账号不能为空",
        },
      }));

      return;
    }

    if (!formState.data.password) {
      setFormState((prev) => ({
        data: prev.data,
        error: {
          ...prev.error,
          password: "密码不能为空",
        },
      }));

      return;
    }

    try {
      setLoginLoading(true);

      await axios.post("/sign-in", {
        account: formState.data.account,
        password: sha256(formState.data.password),
      });

      navigate("/dashboard");
    } catch (e) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: formatError(e),
        duration: 5000,
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen min-h-screen w-full items-center sm:h-auto sm:w-[500px] sm:py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full w-full flex-col items-center justify-center space-y-12 bg-custom px-4 py-16 sm:h-auto sm:rounded-lg sm:border-t-4 sm:border-t-primary-400 sm:shadow-lg"
      >
        <h1 className="text-2xl font-bold">登录酷客简历</h1>
        <div className="w-full space-y-4 sm:max-w-[360px]">
          <div className="w-full space-y-8">
            <CustomInput
              props={{
                value: formState.data.account,
                onValueChange: (value) => {
                  setFormState((prev) => ({
                    data: {
                      ...prev.data,
                      account: value,
                    },
                    error: {
                      ...prev.error,
                      account: "",
                    },
                  }));
                },
                label: "账号",
                placeholder: "请输入用户名 / 邮箱",
                type: "text",
                isClearable: true,
                isInvalid: !!formState.error.account,
                errorMessage: formState.error.account,
              }}
            />
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
              }}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <CustomCheckbox
              props={{
                isSelected: formState.data.rememberMe,
                onValueChange: (isSelected) => {
                  setFormState((prev) => ({
                    data: {
                      ...prev.data,
                      rememberMe: isSelected,
                    },
                    error: prev.error,
                  }));
                },
              }}
            >
              记住我
            </CustomCheckbox>
            <div className="cursor-pointer text-right text-xs text-primary-400">
              找回密码
            </div>
          </div>
          <div className="flex w-full flex-col items-center space-y-2">
            <Button
              disabled={loginLoading}
              className="w-full sm:max-w-[360px]"
              radius="sm"
              color="primary"
              onClick={() => login()}
            >
              登录
            </Button>
          </div>
        </div>

        <div className="text-sm">
          没有账号？
          <span
            onClick={() => navigate("/sign-up")}
            className="cursor-pointer text-primary-400"
          >
            注册
          </span>
        </div>
      </motion.div>
    </div>
  );
}
