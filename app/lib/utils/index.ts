import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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

export const varifyEmail = z.string().email();

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
  key: string;
  sort: number;
}

export const generateVerificationCode = (): string => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
};

export const handleEditorSortEnd = <T extends SortableItem>(
  event: DragEndEvent,
  items: T[],
  formState: {
    [key: string]: any;
  },
  setFormState: React.Dispatch<
    React.SetStateAction<{
      [key: string]: any;
    }>
  >,
) => {
  const { active, over } = event;

  if (!over) return;

  if (active.id === over.id) return;

  const oldIndex = items.findIndex((item) => item.key === active.id);
  const newIndex = items.findIndex((item) => item.key === over.id);

  if (oldIndex === -1 || newIndex === -1) return;

  const newItems = arrayMove(items, oldIndex, newIndex);

  const updatedFormState = { ...formState };

  newItems.forEach((item, index) => {
    updatedFormState[item.key] = {
      ...updatedFormState[item.key],
      sort: index,
    };
  });

  setFormState(updatedFormState);
};
