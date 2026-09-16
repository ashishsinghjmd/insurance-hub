export interface FormFieldConfig {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "email" | "tel" | "checkbox";
  required: boolean;
  errorMessage: string;
}

const payeeFormFields: FormFieldConfig[] = [
  { id: "legalFirstName", label: "Legal First Name", type: "text", required: true, errorMessage: "Legal First Name is required" },
  { id: "legalLastName", label: "Legal Last Name", type: "text", required: true, errorMessage: "Legal Last Name is required" },
  { id: "email", label: "Email", type: "email", required: true, errorMessage: "Email is required" },
  { id: "phone", label: "Phone Number", type: "tel", required: true, errorMessage: "Phone Number is required" },
  { id: "dateOfBirth", label: "Date Of Birth", type: "date", required: true, errorMessage: "Date Of Birth is required" },
  { id: "documentId", label: "Document ID", type: "text", required: false, errorMessage: "" },
  { id: "address", label: "Address", type: "text", required: true, errorMessage: "Address is required" },
  { id: "aptSuite", label: "Apt/Suite", type: "text", required: false, errorMessage: "" },
  { id: "zipCode", label: "ZIP Code", type: "text", required: true, errorMessage: "ZIP Code is required" },
  { id: "city", label: "City", type: "text", required: true, errorMessage: "City is required" },
  { id: "state", label: "State", type: "text", required: true, errorMessage: "State is required" },
];

export default payeeFormFields;
