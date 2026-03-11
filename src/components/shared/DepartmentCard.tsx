import { Building2, Pencil, Trash2, Users } from "lucide-react";

export interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
  manager: string;
}

interface DepartmentCardProps {
  dept: Department;
  color: string;
  onEdit: (dept: Department) => void;
  onDelete: (id: string) => void;
}

const DepartmentCard = ({ dept, color, onEdit, onDelete }: DepartmentCardProps) => {
  return (
    <div className="card hover:shadow-card-hover transition-all duration-300 group">
      
      <div className="flex items-start justify-between mb-4">
        
        <div className={`stat-icon ${color}`}>
          <Building2 size={22} />
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          
          <button
            onClick={() => onEdit(dept)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={() => onDelete(dept.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>

        </div>
      </div>

      <h3 className="font-bold text-slate-900 text-lg mb-1">{dept.name}</h3>

      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
        {dept.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        
        <div className="flex items-center gap-1.5 text-slate-500">
          <Users size={14} />
          <span className="font-semibold text-slate-900">
            {dept.employeeCount}
          </span>
          employees
        </div>

        <div className="text-slate-400">
          Manager:
          <span className="font-medium text-slate-600"> {dept.manager}</span>
        </div>

      </div>
    </div>
  );
};

export default DepartmentCard;