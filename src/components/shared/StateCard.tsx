import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease";
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  changeType = "increase",
  color = "bg-blue-100 text-blue-600",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border p-4 sm:p-5 flex items-center justify-between hover:shadow-md transition-all duration-300">

      <div className="flex flex-col">
        <span className="text-sm text-slate-500">{title}</span>

        <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          {value}
        </span>

        {change && (
          <span
            className={`text-xs mt-1 font-medium ${
              changeType === "increase"
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {icon && (
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      )}
    </div>
  );
}