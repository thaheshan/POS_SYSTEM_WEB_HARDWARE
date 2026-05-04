import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[@$!%*?&]/, "Password must contain at least one special character");


export const mobileSchema = z.string()
  .regex(
    /^(\+\d{1,3}[\s\-]?)?[\d\s\-()]{7,}$/,
    "Mobile number must be valid (e.g., +94 77 123 4567 or 0771234567)"
  )
  .refine(
    (value) => /\d/.test(value.replace(/\D/g, '')),
    "Mobile number must contain at least 7 digits"
  )
  .refine(
    (value) => value.replace(/\D/g, '').length >= 10,
    "Mobile number must have at least 10 digits"
  );