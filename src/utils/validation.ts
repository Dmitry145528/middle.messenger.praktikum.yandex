export type ValidationRule = (value: string) => string | undefined;

const REGEX = {
  /** Имя, фамилия: латиница или кириллица, первая заглавная, без пробелов и цифр */
  name: /^[A-ZА-ЯЁ][a-zA-Zа-яёА-ЯЁ\-]*$/,
  /** Логин: 3–20 символов, латиница, допустимы цифры, точка, дефис, подчёркивание */
  login: /^[a-zA-Z][a-zA-Z0-9_.-]{2,19}$/,
  /** Только цифры (запрещено для логина) */
  digitsOnly: /^\d+$/,
  /** Email: обязательны @ и точка */
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]+/,
  /** Заглавная буква (для пароля) */
  hasUpperCase: /[A-Z]/,
  /** Цифра (для пароля) */
  hasDigit: /\d/,
  /** Нецифровые символы (для извлечения цифр из телефона) */
  nonDigits: /\D/g
} as const;

const RULES: Record<string, ValidationRule> = {
  first_name: (value) => {
    if (!value.trim()) return 'Поле обязательно';
    if (!REGEX.name.test(value)) {
      return 'Латиница или кириллица, первая буква заглавная. Без пробелов и цифр.';
    }
    return undefined;
  },

  second_name: (value) => {
    if (!value.trim()) return 'Поле обязательно';
    if (!REGEX.name.test(value)) {
      return 'Латиница или кириллица, первая буква заглавная. Без пробелов и цифр.';
    }
    return undefined;
  },

  login: (value) => {
    if (!value.trim()) return 'Поле обязательно';

    if (value.includes('@')) {
      return RULES.email(value);
    }
    if (!REGEX.login.test(value) || REGEX.digitsOnly.test(value)) {
      return '3–20 символов, латиница. Допустимы цифры, точка, дефис и подчёркивание.';
    }
    return undefined;
  },

  email: (value) => {
    if (!value.trim()) return 'Поле обязательно';
    if (!REGEX.email.test(value)) {
      return 'Некорректный email. Обязательны @ и точка.';
    }
    return undefined;
  },

  password: (value) => {
    if (!value) return 'Поле обязательно';
    if (value.length < 8 || value.length > 40) {
      return 'От 8 до 40 символов';
    }
    if (!REGEX.hasUpperCase.test(value)) return 'Минимум одна заглавная буква';
    if (!REGEX.hasDigit.test(value)) return 'Минимум одна цифра';
    return undefined;
  },

  phone: (value) => {
    if (!value.trim()) return 'Поле обязательно';
    const digits = value.replace(REGEX.nonDigits, '');
    if (digits.length < 10 || digits.length > 15) {
      return '10–15 цифр, может начинаться с +';
    }
    return undefined;
  },

  message: (value) => {
    if (!value.trim()) return 'Сообщение не должно быть пустым';
    return undefined;
  },

  display_name: () => {
    return undefined;
  },

  oldPassword: (value) => {
    if (!value) return 'Поле обязательно';
    return RULES.password(value);
  },

  newPassword: (value) => {
    if (!value) return 'Поле обязательно';
    return RULES.password(value);
  },

  repeatPassword: (value) => {
    if (!value) return 'Поле обязательно';
    return RULES.password(value);
  }
};

export function validateField(name: string, value: string): string | undefined {
  const rule = RULES[name];
  if (!rule) return undefined;
  return rule(value);
}

export function validateForm(
  form: HTMLFormElement,
  fields: string[]
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const fieldName of fields) {
    const input = form.elements.namedItem(fieldName);
    if (!input || !(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
      continue;
    }
    const error = validateField(fieldName, input.value);
    if (error) {
      errors[fieldName] = error;
    }
  }

  if (fields.includes('repeatPassword') && fields.includes('newPassword')) {
    const newPass = form.elements.namedItem('newPassword');
    const repeatPass = form.elements.namedItem('repeatPassword');
    if (
      newPass instanceof HTMLInputElement &&
      repeatPass instanceof HTMLInputElement &&
      newPass.value &&
      repeatPass.value &&
      newPass.value !== repeatPass.value
    ) {
      errors.repeatPassword = 'Пароли не совпадают';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
