import React from "react";

// Conditional props based on "as"
type InputFieldProps =
  | ({
      as?: "input";
    } & React.InputHTMLAttributes<HTMLInputElement> & {
      label?: string;
      error?: string;
      helperText?: string;
      icon?: React.ReactNode;
    })
  | ({
      as: "textarea";
    } & React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
      label?: string;
      error?: string;
      helperText?: string;
      icon?: React.ReactNode;
    })
  | ({
      as: "select";
    } & React.SelectHTMLAttributes<HTMLSelectElement> & {
      label?: string;
      error?: string;
      helperText?: string;
      icon?: React.ReactNode;
      children: React.ReactNode; // select must have children
    });

export default function InputField({
  label,
  error,
  helperText,
  icon,
  className = "",
  as = "input",
  ...props
}: InputFieldProps) {
  const Component = as as any;

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}

      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}

        <Component
          {...props}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${icon ? "pl-9" : ""}
            ${error ? "border-red-400" : "border-slate-300"}
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${className}`}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}