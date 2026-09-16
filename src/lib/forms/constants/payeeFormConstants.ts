import { z } from "zod";
import { sanitizedString, emailSchema } from "../validationSchemas";
import { parseLocalDate, formatLocalDate } from "@/lib/utils/date-utils";
import { US_STATE_CODE_SET } from "@/lib/data/usStates";
import { SUPPORTED_INT_DOC_TYPES, type SupportedIntDocType } from "@/lib/data/internationalDocTypes";

const dateOfBirthSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine((val) => {
    const d = parseLocalDate(val.includes("T") ? val.split("T")[0] : val);
    return !isNaN(d.getTime());
  }, "Please enter a valid date")
  .refine((val) => {
    const d = parseLocalDate(val.includes("T") ? val.split("T")[0] : val);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return d <= eighteenYearsAgo;
  }, "You must be at least 18 years old.")
  .transform((val) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    if (val.includes("T")) return val.split("T")[0];
    const parts = val.split("/");
    if (parts.length === 3) return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
    const d = parseLocalDate(val);
    return formatLocalDate(d);
  });

const countrySchema = z.string().length(2, "Country must be a 2-letter code").default("US");

export const payeeFormBaseSchema = z.object({
  legalFirstName: sanitizedString(20, 1).refine((v) => /^[a-zA-Z '-]+$/.test(v), "Name contains invalid characters"),
  legalLastName: sanitizedString(20, 2).refine((v) => /^[a-zA-Z '-]+$/.test(v), "Name contains invalid characters"),
  middleName: sanitizedString(20).optional(),
  secondSurname: sanitizedString(20).optional(),
  email: emailSchema,
  phone: z.string().optional(),
  dateOfBirth: dateOfBirthSchema,
  documentId: z.string().trim().optional(),
  country: countrySchema,
  address: sanitizedString(30, 1),
  aptSuite: sanitizedString(30).optional(),
  zipCode: z.string().trim().min(1, "ZIP / Postal Code is required").max(20),
  city: sanitizedString(20, 1),
  state: z.string().trim().max(30).optional(),
  intDocId: sanitizedString(50).optional(),
  intDocType: sanitizedString(50).optional().refine((v) => !v || SUPPORTED_INT_DOC_TYPES.includes(v as SupportedIntDocType), "Invalid international document type"),
  terms1: z.boolean().refine((v) => v === true, "You must attest that the information is correct."),
});

export const payeeFormSchema = payeeFormBaseSchema.superRefine((data, ctx) => {
  const isUS = data.country === "US";
  const digits = data.phone?.replace(/\D/g, "") ?? "";
  if (isUS) {
    if (!data.phone || digits.length !== 10) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a valid US phone number (10 digits)", path: ["phone"] });
    if (!data.zipCode || !/^\d{5}(-\d{4})?$/.test(data.zipCode)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a valid ZIP code", path: ["zipCode"] });
    if (!data.state || !US_STATE_CODE_SET.has(data.state)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a valid US state", path: ["state"] });
  } else {
    if (!data.phone || digits.length < 6 || digits.length > 15) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a valid phone number (6-15 digits)", path: ["phone"] });
    if (!data.intDocId || data.intDocId.trim().length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "International Document ID is required for non-US addresses", path: ["intDocId"] });
    if (!data.intDocType || data.intDocType.trim().length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "International Document Type is required for non-US addresses", path: ["intDocType"] });
  }
});

export type PayeeFormData = z.infer<typeof payeeFormSchema>;

export const defaultPayeeFormValues: PayeeFormData = {
  legalFirstName: "",
  legalLastName: "",
  middleName: "",
  secondSurname: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  documentId: "",
  country: "US",
  address: "",
  aptSuite: "",
  zipCode: "",
  city: "",
  state: "",
  intDocId: "",
  intDocType: "",
  terms1: false,
};

export const validatePayeeForm = (data: unknown) => payeeFormSchema.safeParse(data);

export type PayeeFieldDef = { id: keyof PayeeFormData; label: string; required: boolean; placeholder: string; maxLength?: number };

export const payeeFormFields: PayeeFieldDef[] = [
  { id: "legalFirstName", label: "Legal First Name", required: true, placeholder: "Enter first name", maxLength: 20 },
  { id: "middleName", label: "Middle Name", required: false, placeholder: "Enter middle name", maxLength: 20 },
  { id: "legalLastName", label: "Legal Last Name", required: true, placeholder: "Enter last name", maxLength: 20 },
  { id: "secondSurname", label: "Second Surname", required: false, placeholder: "Enter surname", maxLength: 20 },
  { id: "email", label: "Email", required: true, placeholder: "Enter email", maxLength: 40 },
  { id: "dateOfBirth", label: "Date Of Birth", required: true, placeholder: "Select date of birth" },
  { id: "country", label: "Country", required: true, placeholder: "Select country" },
  { id: "phone", label: "Phone Number", required: true, placeholder: "Enter phone number" },
  { id: "documentId", label: "Document ID", required: false, placeholder: "Enter SSN" },
  { id: "address", label: "Address", required: true, placeholder: "Enter address", maxLength: 30 },
  { id: "aptSuite", label: "Apt/Suite", required: false, placeholder: "Enter Apt/Suite (optional)", maxLength: 30 },
  { id: "zipCode", label: "ZIP Code", required: true, placeholder: "Enter ZIP code", maxLength: 20 },
  { id: "city", label: "City", required: true, placeholder: "Enter city", maxLength: 20 },
  { id: "state", label: "State", required: true, placeholder: "Select state" },
];
