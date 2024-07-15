import { LoaderFunction, redirect } from "@remix-run/node";
import { json, useNavigate } from "@remix-run/react";
import axios from "axios";
import { sha256 } from "js-sha256";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { FormInput, PasswordInput } from "@/components/Input";
import PageCard from "@/components/PageCard";
import { useToast } from "@/components/Toaster/hooks";
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

export default function SignInPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    data: {
      account: "",
      password: "",
    },
    error: {
      account: "",
      password: "",
    },
  });

  const canLogin = useMemo(() => {
    const errorArray = Object.values(formState.error);

    return errorArray.every((error) => !error);
  }, [formState.error]);

  const [loginLoading, setLoginLoading] = useState(false);

  const login = async () => {
    const validators = [
      {
        validator: () =>
          FormValidator.signInAccountValidator(formState.data.account),
        field: "account",
      },
      {
        validator: () =>
          FormValidator.signInPasswordValidator(formState.data.password),
        field: "password",
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
      setLoginLoading(true);

      await axios.post("/api/account/sign-in", {
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
    <PageCard title="登录酷客简历">
      <div className="w-full space-y-6 sm:max-w-[360px]">
        <div className="w-full space-y-4">
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
          <div className="relative w-full">
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
            <div
              onClick={() => navigate("/reset-password")}
              className="absolute right-0 top-1.5 cursor-pointer text-xs text-primary hover:underline"
            >
              找回密码
            </div>
          </div>
        </div>
        <Button
          disabled={!canLogin || loginLoading}
          className="w-full sm:max-w-[360px]"
          onClick={() => login()}
        >
          {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "登录"}
        </Button>
      </div>
      <div className="text-sm">
        没有账号？
        <span
          onClick={() => navigate("/sign-up")}
          className="cursor-pointer text-primary hover:underline"
        >
          注册
        </span>
      </div>
    </PageCard>
  );
}
