import { LoaderFunction, redirect } from "@remix-run/node";
import { json, useNavigate } from "@remix-run/react";
import axios from "axios";
import { motion } from "framer-motion";
import { sha256 } from "js-sha256";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { FormInput, PasswordInput } from "@/components/Input";
import { useToast } from "@/components/Toaster/hooks";
import { checkUserIsLogin } from "@/lib/services/auth.server";
import { formatError, sleep } from "@/lib/utils";

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

      await axios.post("/api/sign-in", {
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
        className="flex h-full w-full flex-col items-center justify-center space-y-12 bg-custom px-4 py-16 sm:h-auto sm:rounded-lg sm:border-t-4 sm:border-t-primary sm:shadow-lg"
      >
        <h1 className="text-2xl font-bold">登录酷客简历</h1>
        <div className="w-full space-y-4 sm:max-w-[360px]">
          <div className="w-full space-y-3">
            <FormInput
              label="账号"
              placeholder="请输入用户名 / 邮箱"
              value={formState.data.account}
              error={formState.error.account}
              onValueChange={(v, e) => {
                setFormState((prev) => ({
                  data: {
                    ...prev.data,
                    account: v,
                  },
                  error: {
                    ...prev.error,
                    account: e,
                  },
                }));
              }}
            />
            <PasswordInput
              label="密码"
              placeholder="请输入密码"
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
          </div>
          <div className="flex w-full items-center justify-between">
            {/* <CustomCheckbox
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
            </CustomCheckbox> */}
            <div className="cursor-pointer text-right text-xs text-primary">
              找回密码
            </div>
          </div>
          <div className="flex w-full flex-col items-center space-y-2">
            <Button
              disabled={loginLoading}
              className="w-full sm:max-w-[360px]"
              onClick={() => login()}
            >
              {loginLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "登录"
              )}
            </Button>
          </div>
        </div>
        <div className="text-sm">
          没有账号？
          <span
            onClick={() => navigate("/sign-up")}
            className="cursor-pointer text-primary"
          >
            注册
          </span>
        </div>
      </motion.div>
    </div>
  );
}
