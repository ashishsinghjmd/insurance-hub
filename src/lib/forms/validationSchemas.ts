import { z } from "zod";

export const sanitizedString = (max: number, min = 0) => {
  let s = z.string().trim().max(max, `Max length is ${max} characters`);
  if (min > 0) s = s.min(min, `Minimum ${min} characters required`);
  return s;
};

export const emailSchema = z.string().trim().email("Invalid email format").max(40);

export const phoneSchema = z.string().trim().min(1, "Phone is required");

export function createFieldSchema(type: string, required: boolean, maxLength?: number) {
  let s: z.ZodTypeAny = z.string().trim();
  if (maxLength) s = (s as z.ZodString).max(maxLength);
  if (required) s = (s as z.ZodString).min(1, "This field is required");
  else s = (s as z.ZodString).optional().or(z.literal(""));
  if (type === "email" && required) s = emailSchema;
  return s;
}
