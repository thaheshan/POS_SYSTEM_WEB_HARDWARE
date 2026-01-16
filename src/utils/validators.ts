export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateBarcode = (barcode: string): boolean => {
  return barcode.length >= 8 && /^[0-9]+$/.test(barcode);
};

export const validateSKU = (sku: string): boolean => {
  return sku.length >= 3 && /^[A-Z0-9-]+$/.test(sku);
};
