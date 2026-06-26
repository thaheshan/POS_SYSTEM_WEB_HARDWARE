import z from "zod";

export const staffApprovalSchema = {
  staff_id: z.string().min(1, "Staff ID is required"),
  is_approved: z.boolean().default(false),
};

export type StaffApprovalFormValues = z.infer<typeof staffApprovalSchema>;