export const NEPAL_COUNTRY_CODE = "+977";

export const formatPhoneWithCode = (phone: string | undefined): string => {
  if (!phone) return NEPAL_COUNTRY_CODE;
  if (phone.startsWith(NEPAL_COUNTRY_CODE)) return phone;
  const digits = phone.replace(/\D/g, "").slice(0, 10);
  return NEPAL_COUNTRY_CODE + digits;
};

export const handlePhoneInput = (
  value: string,
  setPhone: (phone: string) => void,
  setError?: (error: string) => void,
): void => {
  if (!value.startsWith(NEPAL_COUNTRY_CODE)) return;
  const digits = value.slice(4).replace(/\D/g, "");
  if (digits.length <= 10) {
    setPhone(NEPAL_COUNTRY_CODE + digits);
    if (setError) {
      if (digits.length === 10) {
        setError("");
      } else if (digits.length > 0) {
        setError("Phone number must be exactly 10 digits");
      } else {
        setError("");
      }
    }
  }
};

export const isValidNepalPhone = (phone: string): boolean => {
  if (!phone.startsWith(NEPAL_COUNTRY_CODE)) return false;
  const digits = phone.slice(4).replace(/\D/g, "");
  return digits.length === 10;
};

export const getPhoneDigits = (phone: string): string => {
  return phone.startsWith(NEPAL_COUNTRY_CODE)
    ? phone.slice(4)
    : phone.replace(/\D/g, "");
};
