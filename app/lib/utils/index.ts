import { isAxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { sha256 } from "js-sha256";
import { twMerge } from "tailwind-merge";
import { ZodSchema, z } from "zod";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatError = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.data?.message;
  } else if (error instanceof Error) {
    return error.message;
  }

  return "未知错误";
};

export const validateEmail = (email: string) => {
  return email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
};

export const validatePayload = (schema: ZodSchema, data: unknown) => {
  try {
    schema.parse(data);
  } catch (e) {
    throw new Error("请求参数非法");
  }
};

export const generateRandomSalt = (length = 16) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let salt = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    salt += charset[randomIndex];
  }

  return salt;
};

export const verifyPassword = (
  password: string,
  salt: string,
  input: string,
) => {
  return password === sha256(input + salt);
};

export const varifyInt = z.number().int().min(1);

export const checkRichTextOutputIsNull = (value: string) => {
  const regArray = [
    "<p></p>",
    "<ul><li><p></p></li></ul>",
    "<ol><li><p></p></li></ol>",
    "<pre><code></code></pre>",
    "<blockquote><p></p></blockquote>",
  ];

  for (const reg of regArray) {
    if (value === reg) {
      return "";
    }
  }

  return value;
};

interface SortableItem {
  sort: number;
}

export const swapItems = <T extends SortableItem>(
  currentKey: string,
  targetKey: string,
  setFormState: React.Dispatch<
    React.SetStateAction<{
      [key: string]: T;
    }>
  >,
) => {
  setFormState((prev) => {
    if (!currentKey || !targetKey) return prev;

    const currentItem = prev[currentKey];
    const targetItem = prev[targetKey];

    if (!currentItem || !targetItem) return prev;

    return {
      ...prev,
      [currentKey]: {
        ...currentItem,
        sort: targetItem.sort,
      },
      [targetKey]: {
        ...targetItem,
        sort: currentItem.sort,
      },
    };
  });
};

export const generateVerificationCode = (): string => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
};
