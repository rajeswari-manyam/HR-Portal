export type Status   = "Active" | "Overdue" | "Completed" | "On Hold" | "Planning";
export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface TeamMember {
  initials: string;
  color: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  manager: string;
  managerInitials: string;
  managerColor: string;
  startDate: string;
  endDate: string;
  status: Status;
  progress: number;
  priority: Priority;
  budget: number;
  spent: number;
  team: TeamMember[];
  extraTeam?: number;
}
