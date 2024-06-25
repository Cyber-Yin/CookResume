import { isAxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { sha256 } from "js-sha256";
import { twMerge } from "tailwind-merge";
import { ZodSchema } from "zod";

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
