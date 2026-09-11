/**
 * Claim Form Field Component
 *
 * Renders individual form fields with validation, hints, and error states.
 * Follows juice-pro's DynamicForm field rendering pattern.
 *
 * @module components/claims/ClaimFormField
 */

"use client";

import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  FormFieldConfig,
  SelectOption,
} from "./ClaimFormFields";
import { CLAIM_TYPE_OPTIONS } from "./ClaimFormFields";

interface ClaimFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
> {
  field: FormFieldConfig;
  control: Control<any>;
  name: TName;
  error?: string;
  disabled?: boolean;
}

export function ClaimFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
>({
  field,
  control,
  name,
  error,
  disabled,
}: ClaimFormFieldProps<TFieldValues, TName>) {
  // Get select options based on field type
  const getSelectOptions = (): SelectOption[] => {
    if (field.id === "type") {
      return CLAIM_TYPE_OPTIONS;
    }
    return [];
  };

  return (
    <div className="space-y-2">
      {/* Label with required indicator and info icon (juice-pro style) */}
      <div className="flex items-center gap-2">
        <Label
          htmlFor={field.id}
          className="text-sm font-medium text-foreground"
        >
          {field.label}
        </Label>
        {field.required && (
          <span
            className="text-red-600 font-bold"
            aria-label="required"
            title="This field is required"
          >
            *
          </span>
        )}
        {field.hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                {field.hint}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Text/email/tel input */}
      {(field.type === "text" || field.type === "email" || field.type === "tel") && (
        <Controller
          name={name}
          control={control}
          render={({ field: fieldProps }) => (
            <Input
              {...fieldProps}
              id={field.id}
              type={field.type === "tel" ? "tel" : field.type}
              placeholder={field.placeholder}
              disabled={disabled}
              maxLength={field.maxLength}
              pattern={field.pattern}
              className={cn(
                "transition-colors bg-white",
                error && "border-destructive focus:ring-destructive/50"
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.id}-error` : undefined}
            />
          )}
        />
      )}

      {/* Date input */}
      {field.type === "date" && (
        <Controller
          name={name}
          control={control}
          render={({ field: fieldProps }) => (
            <Input
              {...fieldProps}
              id={field.id}
              type="date"
              disabled={disabled}
              className={cn(
                "transition-colors bg-white",
                error && "border-destructive focus:ring-destructive/50"
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.id}-error` : undefined}
            />
          )}
        />
      )}

      {/* Select input */}
      {field.type === "select" && (
        <Controller
          name={name}
          control={control}
          render={({ field: fieldProps }) => {
            const options = getSelectOptions();
            return (
              <Select
                value={fieldProps.value || ""}
                onValueChange={fieldProps.onChange}
                disabled={disabled}
              >
                <SelectTrigger
                  className={cn(
                    "text-muted-foreground font-semibold text-sm transition-colors bg-white",
                    error && "border-destructive focus:ring-destructive/50"
                  )}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${field.id}-error` : undefined}
                >
                  <SelectValue
                    placeholder={field.placeholder || "Select an option"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        />
      )}

      {/* Textarea input */}
      {field.type === "textarea" && (
        <Controller
          name={name}
          control={control}
          render={({ field: fieldProps }) => (
            <Textarea
              {...fieldProps}
              id={field.id}
              placeholder={field.placeholder}
              rows={4}
              disabled={disabled}
              maxLength={field.maxLength}
              className={cn(
                "resize-none transition-colors bg-white",
                error && "border-destructive focus:ring-destructive/50"
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.id}-error` : undefined}
            />
          )}
        />
      )}

      {/* Checkbox input */}
      {field.type === "checkbox" && (
        <Controller
          name={name}
          control={control}
          render={({ field: fieldProps }) => (
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id={field.id}
                checked={fieldProps.value as boolean}
                onChange={(e) => fieldProps.onChange(e.target.checked)}
                disabled={disabled}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
              />
              <label
                htmlFor={field.id}
                className="text-sm text-foreground leading-relaxed cursor-pointer"
              >
                {field.label}
              </label>
            </div>
          )}
        />
      )}

      {/* Error message */}
      {error && (
        <p
          id={`${field.id}-error`}
          className="text-xs text-destructive font-medium mt-1 flex items-center gap-1"
        >
          <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
          {error}
        </p>
      )}

      {/* Character counter for textarea */}
      {field.type === "textarea" && field.maxLength && (
        <Controller
          name={name}
          control={control}
          render={({ field: fieldProps }) => {
            const length = (fieldProps.value as string)?.length || 0;
            return (
              <p className="text-xs text-muted-foreground text-right">
                {length} / {field.maxLength}
              </p>
            );
          }}
        />
      )}
    </div>
  );
}

export default ClaimFormField;

