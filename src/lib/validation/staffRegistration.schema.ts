import z, { refine } from "zod";
import { mobileSchema, passwordSchema } from "./common.schema";

export const staffRegistrationSchema = z.object({
  full_name: z.string().min(2, "First name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  mobile_number: mobileSchema,
  shop_id: z.string().min(1, "Shop ID is required"),
  role: z.enum(["manager", "cashier", "store_keeper", "accountant"], {
    message: "Please select a valid role",
  }),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
});


export type StaffRegistrationFormValues = z.infer<typeof staffRegistrationSchema>;