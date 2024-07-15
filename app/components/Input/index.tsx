"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleX, Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";

import { Label } from "../Label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-[1.5px] border-custom-primary bg-custom-primary px-3 py-2 text-sm outline-none transition-all file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-custom-secondary focus-visible:border-primary-light disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

interface FormInputProps extends InputProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  value: string;
  error?: string;
  onValueChange: (value: string, error: string) => void;
}

const FormInput = ({
  onValueChange,
  required,
  label,
  placeholder,
  description,
  value,
  error,
  ...rest
}: FormInputProps) => {
  const id = useId();

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <>
          {required ? (
            <div className="inline-flex items-center space-x-1">
              <Label htmlFor={id}>{label}</Label>
              <div className="text-xs text-danger-light">*</div>
            </div>
          ) : (
            <Label htmlFor={id}>{label}</Label>
          )}
        </>
      )}

      <div className="relative w-full">
        <Input
          {...rest}
          value={value}
          onChange={(e) => onValueChange(e.target.value, "")}
          placeholder={placeholder}
          id={id}
          className={cn("pr-7", rest.className, {
            "border-danger-light": error,
          })}
        />
        <AnimatePresence>
          {value && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.15,
              }}
              className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer"
            >
              <CircleX
                fill="#0f172a"
                onClick={() => onValueChange("", "")}
                className="h-full w-full text-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error ? (
        <div className="text-xs text-danger-light">{error}</div>
      ) : (
        <>
          {description && (
            <div className="text-xs text-custom-tertiary">{description}</div>
          )}
        </>
      )}
    </div>
  );
};

const PasswordInput = ({
  onValueChange,
  label,
  placeholder,
  description,
  value,
  error,
  ...rest
}: FormInputProps) => {
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          {...rest}
          value={value}
          onChange={(e) => onValueChange(e.target.value, "")}
          placeholder={placeholder}
          type={passwordVisible ? "text" : "password"}
          id={id}
          className={cn("pr-7", {
            "border-danger-light": error,
          })}
        />
        <div className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer">
          {passwordVisible ? (
            <EyeOff
              onClick={() => setPasswordVisible((prev) => !prev)}
              className="h-full w-full text-custom-primary"
            />
          ) : (
            <Eye
              onClick={() => setPasswordVisible((prev) => !prev)}
              className="h-full w-full text-custom-primary"
            />
          )}
        </div>
      </div>
      {error ? (
        <div className="text-xs text-danger-light">{error}</div>
      ) : (
        <>
          {description && (
            <div className="text-xs text-custom-tertiary">{description}</div>
          )}
        </>
      )}
    </div>
  );
};

export { Input, FormInput, PasswordInput };
