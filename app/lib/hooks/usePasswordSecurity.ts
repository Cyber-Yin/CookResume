import { useMemo } from "react";

export const usePasswordSecurity = (password: string) => {
  const passwordSecurity = useMemo(() => {
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
  }, [password]);

  return {
    passwordSecurity,
  };
};
