import React from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  className = "",
}: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input py-2 ${className}`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}