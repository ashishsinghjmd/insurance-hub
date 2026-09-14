/**
 * Claim Form Field Configuration
 *
 * Centralized field definitions following juice-pro's hub-registry pattern.
 * This makes it easy to add/modify fields and maintain consistency across the app.
 *
 * @module components/claims/ClaimFormFields
 */

export interface FormFieldConfig {
  id: string;
  label: string;
  type: "text" | "select" | "textarea" | "date" | "number" | "email" | "tel" | "checkbox";
  required: boolean;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  pattern?: string;
  validation?: (value: unknown) => boolean | string;
}

export interface SelectOption {
  value: string;
  label: string;
}

// ── Claim type options ──
export const CLAIM_TYPE_OPTIONS: SelectOption[] = [
  { value: "auto", label: "Auto Insurance" },
  { value: "home", label: "Home Insurance" },
  { value: "life", label: "Life Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "travel", label: "Travel Insurance" },
  { value: "disability", label: "Disability Insurance" },
];

// ── Form field definitions (expanded like juice-pro's insurancePayeeFields) ──
export const CLAIM_FORM_FIELDS: FormFieldConfig[] = [
  // Personal Information Section
  {
    id: "firstName",
    label: "First Name",
    type: "text",
    required: true,
    placeholder: "Enter first name",
    hint: "Your legal first name",
  },
  {
    id: "middleName",
    label: "Middle Name",
    type: "text",
    required: false,
    placeholder: "Enter middle name",
    hint: "Optional middle name",
  },
  {
    id: "lastName",
    label: "Last Name",
    type: "text",
    required: true,
    placeholder: "Enter last name",
    hint: "Your legal last name",
  },
  {
    id: "surname",
    label: "Surname",
    type: "text",
    required: false,
    placeholder: "Enter surname",
    hint: "Additional surname if applicable",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "Enter email address",
    hint: "We'll send claim updates to this email",
  },
  {
    id: "dateOfBirth",
    label: "Date of Birth",
    type: "date",
    required: true,
    hint: "Required for claim verification",
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "tel",
    required: true,
    placeholder: "Enter phone number",
    hint: "We may need to contact you about your claim",
  },

  // Policy Information Section
  {
    id: "policyId",
    label: "Policy Number",
    type: "text",
    required: true,
    placeholder: "e.g. POL-10342",
    hint: "The policy this claim is filed against",
  },
  {
    id: "type",
    label: "Claim Type",
    type: "select",
    required: true,
    hint: "Select the type of insurance claim",
  },

  // Claim Details Section
  {
    id: "incidentDate",
    label: "Incident Date",
    type: "date",
    required: true,
    hint: "When did the incident occur",
  },
  {
    id: "amount",
    label: "Claim Amount",
    type: "text",
    required: true,
    placeholder: "e.g. 4200 or $4,200",
    hint: "The amount you are claiming (in your local currency)",
  },

  // Address Information Section
  {
    id: "address",
    label: "Address",
    type: "text",
    required: true,
    placeholder: "Enter street address",
    hint: "Your current address",
  },
  {
    id: "aptSuite",
    label: "Apt/Suite",
    type: "text",
    required: false,
    placeholder: "Apartment or suite number",
    hint: "Optional apartment or suite number",
  },
  {
    id: "city",
    label: "City",
    type: "text",
    required: true,
    placeholder: "Enter city",
    hint: "City of residence",
  },
  {
    id: "state",
    label: "State",
    type: "text",
    required: true,
    placeholder: "Enter state/province",
    hint: "State or province",
  },
  {
    id: "zipCode",
    label: "ZIP Code",
    type: "text",
    required: true,
    placeholder: "Enter ZIP code",
    hint: "Postal or ZIP code",
  },

  // Claim Description Section
  {
    id: "description",
    label: "Incident Description",
    type: "textarea",
    required: true,
    placeholder: "Provide a detailed account of the incident…",
    hint: "Describe what happened in detail. Include relevant details that support your claim.",
    maxLength: 2000,
  },

  // Terms & Conditions
  {
    id: "terms",
    label: "I attest that the information and documentation submitted herein is complete, correct, and accurate to the best of my knowledge",
    type: "checkbox",
    required: true,
    hint: "You must agree to proceed with your claim",
  },
];

/**
 * Get form field by ID
 * Similar to juice-pro's field lookup pattern
 */
export function getFormField(id: string): FormFieldConfig | undefined {
  return CLAIM_FORM_FIELDS.find((field) => field.id === id);
}

/**
 * Get all required fields
 */
export function getRequiredFields(): FormFieldConfig[] {
  return CLAIM_FORM_FIELDS.filter((field) => field.required);
}

/**
 * Format field value for display
 */
export function formatFieldValue(fieldId: string, value: unknown): string {
  const field = getFormField(fieldId);
  if (!field) return String(value);

  switch (field.type) {
    case "date":
      return new Date(value as string).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "select": {
      const option = CLAIM_TYPE_OPTIONS.find((opt) => opt.value === value);
      return option?.label || String(value);
    }
    default:
      return String(value);
  }
}
