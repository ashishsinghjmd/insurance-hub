export type PayeeStatus = "active" | "inactive" | "inactive_locked" | "closed" | "pending" | "registered_not_verified" | "suspended" | "unactivated" | "active_pin_not_set" | "suspended_pin_not_set";

export interface Payee {
  id: string | number;
  name: string;
  email: string;
  rpid: string;
  cardNumber: string;
  account: string;
  status: PayeeStatus;
  balance: number;
  dateCreated: string;
  action?: string;
  payeeName?: string;
  payeeTitle?: string;
  mobilePhone?: string;
  address?: string;
  referenceNumber?: string;
  amount?: number | string;
  checked?: boolean;
  [key: string]: unknown;
}

export interface PayeeTableRow extends Payee {
  actions?: { view: () => void; edit: () => void };
}
