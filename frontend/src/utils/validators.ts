export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'E-posta adresi gereklidir.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Geçerli bir e-posta adresi giriniz.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Şifre gereklidir.';
  if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır.';
  if (!/[A-Z]/.test(password)) return 'Şifre en az bir büyük harf içermelidir.';
  if (!/[0-9]/.test(password)) return 'Şifre en az bir rakam içermelidir.';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} gereklidir.`;
  return null;
}

export function validateFile(file: File | null, allowedTypes: string[]): string | null {
  if (!file) return 'Dosya seçiniz.';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!allowedTypes.includes(ext)) {
    return `Yalnızca ${allowedTypes.join(', ')} dosyaları kabul edilmektedir.`;
  }
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) return 'Dosya boyutu 10 MB\'ı aşmamalıdır.';
  return null;
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  if (value.length < min) return `${fieldName} en az ${min} karakter olmalıdır.`;
  return null;
}
