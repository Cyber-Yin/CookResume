import axios from "axios";
import { useEffect, useState } from "react";

import { useToast } from "@/components/Toaster/hooks";

import { formatError } from "../utils";

export const useSendCode = (initialCountdown: number) => {
  const { toast } = useToast();

  const [countdown, setCountdown] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      setIsButtonDisabled(true);
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsButtonDisabled(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [countdown]);

  const sendCode = async (data: {
    type: string;
    user_email: string;
    new_email?: string;
  }) => {
    try {
      setCountdown(initialCountdown);

      await axios.post("/api/send-code", data);
    } catch (e) {
      toast({
        title: "发送验证码失败",
        description: formatError(e),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return {
    countdown,
    sendCode,
    isButtonDisabled,
  };
};
