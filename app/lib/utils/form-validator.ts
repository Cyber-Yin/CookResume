import { z } from "zod";

const emailZodSchema = z.string().email();

export const FormValidator = {
  userNameValidator: (userName: string) => {
    if (!userName) {
      throw new Error("用户名不能为空");
    }

    if (userName.length < 3 || userName.length > 12) {
      throw new Error("用户名长度必须在 3-12 位之间");
    }

    const regCheck = userName.match(/^[a-zA-Z][a-zA-Z0-9_]*$/);

    if (!regCheck) {
      throw new Error("用户名格式错误");
    }
  },

  emailValidator: (email: string) => {
    if (!email) {
      throw new Error("邮箱不能为空");
    }

    try {
      emailZodSchema.parse(email);
    } catch (e) {
      throw new Error("邮箱格式错误");
    }
  },

  passwordValidator: (password: string) => {
    if (!password) {
      throw new Error("密码不能为空");
    }

    let passwordSecurity = 0;

    if (password.length < 8) {
      passwordSecurity = 1;
    } else {
      const hasLetters = /[a-zA-Z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);

      const strength = [hasLetters, hasNumbers, hasSpecialChars].filter(
        Boolean,
      ).length;

      passwordSecurity = strength;
    }

    if (passwordSecurity < 2) {
      throw new Error("密码强度不足");
    }
  },

  passwordConfirmValidator: (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      throw new Error("两次输入的密码不一致");
    }
  },

  readPolicyValidator: (readPolicy: boolean) => {
    if (!readPolicy) {
      throw new Error("请阅读并同意《隐私政策》");
    }
  },

  signInAccountValidator: (account: string) => {
    if (!account) {
      throw new Error("账号不能为空");
    }
  },

  signInPasswordValidator: (password: string) => {
    if (!password) {
      throw new Error("密码不能为空");
    }
  },

  verificationCodeValidator: (verificationCode: string) => {
    if (!verificationCode) {
      throw new Error("验证码不能为空");
    }

    if (verificationCode.length !== 6) {
      throw new Error("验证码长度错误");
    }
  },
};
