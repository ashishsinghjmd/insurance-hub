"use client";

/**
 * New Claim Page
 *
 * File a new insurance claim against an existing policy.
 * Built following juice-pro's GenericHubInviteForm architecture:
 * - Centralized field configuration
 * - Comprehensive form validation with Zod
 * - Modular component structure
 * - Professional UX with error handling
 *
 * @module app/claims/new/page
 */

import React, { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, AlertCircle, Loader2, Info } from "lucide-react";
import { Card as DSCard, CardContent, CardHeader } from "@/components/ui/card";
import { Button as DSButton } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClaimFormField } from "@/components/claims/ClaimFormField";
import {
  CLAIM_FORM_FIELDS,
  CLAIM_TYPE_OPTIONS,
} from "@/components/claims/ClaimFormFields";
import { juiceFetch } from "@/lib/api";

// ── Form schema with Zod validation ──
const claimFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  middleName: z.string().min(0).max(100),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  surname: z.string().min(0).max(100),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (value) => {
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 18 && age <= 120;
      },
      "You must be 18 years or older"
    ),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(10, "Phone number must be at least 10 digits"),
  policyId: z
    .string()
    .min(1, "Policy number is required")
    .min(3, "Policy number must be at least 3 characters")
    .regex(/^[A-Z0-9\-]+$/, "Policy number must contain only letters, numbers, and hyphens"),
  type: z.string().min(1, "Claim type is required"),
  incidentDate: z
    .string()
    .min(1, "Incident date is required")
    .refine(
      (value) => {
        const date = new Date(value);
        const now = new Date();
        return date <= now && date.getFullYear() >= now.getFullYear() - 10;
      },
      "Please enter a valid incident date (within last 10 years)"
    ),
  amount: z
    .string()
    .min(1, "Claim amount is required")
    .refine(
      (value) => {
        const cleaned = value.replace(/[$,]/g, "");
        const num = parseFloat(cleaned);
        return !isNaN(num) && num > 0 && num <= 999999999;
      },
      "Please enter a valid amount (max 999,999,999)"
    ),
  address: z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters"),
  aptSuite: z.string().min(0).max(100),
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .min(2, "State must be at least 2 characters"),
  zipCode: z
    .string()
    .min(1, "ZIP code is required")
    .min(3, "ZIP code must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms to proceed",
  }),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ParsedError {
  message?: string;
  code?: string;
}

export default function NewClaimPage() {
  const router = useRouter();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── State management ──
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<ParsedError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form setup with react-hook-form ──
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      surname: "",
      email: "",
      dateOfBirth: "",
      phone: "",
      policyId: "",
      type: "",
      incidentDate: "",
      amount: "",
      address: "",
      aptSuite: "",
      city: "",
      state: "",
      zipCode: "",
      description: "",
      terms: false,
    },
  });

  // ── Success handler (juice-pro style) ──
  const handleSuccess = useCallback(() => {
    setSubmitSuccess(true);
    setSubmitError(null);

    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    redirectTimerRef.current = setTimeout(() => {
      router.push("/claims");
    }, 3000);
  }, [router]);

  // ── Error handler (juice-pro style) ──
  const handleError = useCallback((error: unknown) => {
    const parsedError: ParsedError = {
      message:
        typeof error === "string"
          ? error
          : (error as Record<string, unknown>)?.message
            ? String((error as Record<string, unknown>).message)
            : "Failed to file claim. Please try again.",
    };
    setSubmitError(parsedError);
  }, []);

  // ── Form submission handler ──
  const onSubmit: SubmitHandler<ClaimFormData> = useCallback(
    async (data) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const payload = {
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName || "",
          surName: data.surname || "",
          dateOfBirth: data.dateOfBirth,
          docId: "123456789",
          docType: "SSN",
          email: data.email,
          phone: data.phone?.replace(/\D/g, ""),
          addressLine1: data.address,
          aptSuite: data.aptSuite || "",
          city: data.city,
          state: data.state?.length === 2 ? data.state.toUpperCase() : "CA",
          zip: data.zipCode,
          country: "US",
          isInternational: false,
          agreeTerms: data.terms,
          subscribeToEmails: true,
          isReceiveSms: false,
        };
        const res = await juiceFetch("/v1/insurance/invite", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());

        console.log("Claim submitted:", data);
        handleSuccess();
      } catch (error) {
        handleError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleSuccess, handleError]
  );

  // ── Render error alert ──
  const renderErrorAlert = () => {
    if (!submitError) return null;

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to File Claim</AlertTitle>
        <AlertDescription>{submitError.message}</AlertDescription>
      </Alert>
    );
  };

  // ── Render success alert ──
  const renderSuccessAlert = () => {
    if (!submitSuccess) return null;

    return (
      <Alert className="mb-6 border-green-200 bg-green-50 text-green-900">
        <Check className="h-4 w-4" />
        <AlertTitle>Claim Filed Successfully</AlertTitle>
        <AlertDescription>
          Your claim has been submitted. Redirecting to claims list…
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="portal-content">
      {/* Back button */}
      <button
        className="portal-back-link"
        onClick={() => router.push("/claims")}
        aria-label="Back to claims"
      >
        <ArrowLeft size={14} /> Back to claims
      </button>

      {/* Alerts */}
      {renderErrorAlert()}
      {renderSuccessAlert()}

      {/* Form card (juice-pro style with 2-column layout) */}
      <DSCard className="max-w-4xl border-border">
        {/* Card Header with blue accent bar (juice-pro style) */}
        <CardHeader className="pb-0 border-b-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-sm" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">File a Claim</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Register a new claim against an existing policy
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CLAIM_FORM_FIELDS.filter(
                  (f) => ["firstName", "middleName", "lastName", "surname"].includes(f.id)
                ).map((field) => (
                  <div key={field.id}>
                    <ClaimFormField
                      field={field}
                      control={control as any}
                      name={(field.id as any) as never}
                      error={
                        errors[field.id as keyof ClaimFormData]?.message as
                          | string
                          | undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CLAIM_FORM_FIELDS.filter(
                  (f) => ["email", "phone", "dateOfBirth"].includes(f.id)
                ).map((field) => (
                  <div key={field.id}>
                    <ClaimFormField
                      field={field}
                      control={control as any}
                      name={(field.id as any) as never}
                      error={
                        errors[field.id as keyof ClaimFormData]?.message as
                          | string
                          | undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Information Section */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Policy Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CLAIM_FORM_FIELDS.filter(
                  (f) => ["policyId", "type"].includes(f.id)
                ).map((field) => (
                  <div key={field.id}>
                    <ClaimFormField
                      field={field}
                      control={control as any}
                      name={(field.id as any) as never}
                      error={
                        errors[field.id as keyof ClaimFormData]?.message as
                          | string
                          | undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Information Section */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Incident Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CLAIM_FORM_FIELDS.filter(
                  (f) => ["incidentDate", "amount"].includes(f.id)
                ).map((field) => (
                  <div key={field.id}>
                    <ClaimFormField
                      field={field}
                      control={control as any}
                      name={(field.id as any) as never}
                      error={
                        errors[field.id as keyof ClaimFormData]?.message as
                          | string
                          | undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Address Information Section */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CLAIM_FORM_FIELDS.filter(
                  (f) => ["address", "aptSuite", "zipCode", "city", "state"].includes(f.id)
                ).map((field) => (
                  <div
                    key={field.id}
                    className={field.id === "address" ? "md:col-span-2" : ""}
                  >
                    <ClaimFormField
                      field={field}
                      control={control as any}
                      name={(field.id as any) as never}
                      error={
                        errors[field.id as keyof ClaimFormData]?.message as
                          | string
                          | undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Claim Description Section */}
            <div>
              <div>
                {CLAIM_FORM_FIELDS.filter(
                  (f) => f.id === "description"
                ).map((field) => (
                  <div key={field.id}>
                    <ClaimFormField
                      field={field}
                      control={control as any}
                      name={(field.id as any) as never}
                      error={
                        errors[field.id as keyof ClaimFormData]?.message as
                          | string
                          | undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div>
              {CLAIM_FORM_FIELDS.filter(
                (f) => f.id === "terms"
              ).map((field) => (
                <div key={field.id}>
                  <ClaimFormField
                    field={field}
                    control={control as any}
                    name={(field.id as any) as never}
                    error={
                      errors[field.id as keyof ClaimFormData]?.message as
                        | string
                        | undefined
                    }
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>

            {/* Information box (juice-pro style) */}
            <div className="flex gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex-shrink-0 pt-0.5">
                <Info className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Important Information
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All information provided will be used to process your claim.</li>
                  <li>• Please ensure all details are accurate and complete to avoid delays.</li>
                  <li>• You will receive a confirmation email with your claim reference number.</li>
                  <li>• Typical processing time is 5-10 business days.</li>
                </ul>
              </div>
            </div>

            {/* Action buttons (juice-pro style) */}
            <div className="flex gap-3 pt-4">
              <DSButton
                type="submit"
                disabled={isSubmitting || !isValid}
                className="min-w-fit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Filing claim…
                  </>
                ) : (
                  "File Claim"
                )}
              </DSButton>
              <DSButton
                type="button"
                variant="secondary"
                onClick={() => router.push("/claims")}
                disabled={isSubmitting}
              >
                Cancel
              </DSButton>
            </div>
          </form>
        </CardContent>
      </DSCard>
    </div>
  );
}

