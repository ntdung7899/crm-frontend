export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: string;
  companyName?: string;
  position?: string;
  status: ContactStatus;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  notes?: string;
  avatar?: string;
}

export enum ContactStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  LEAD = "lead",
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  address?: Address;
  phone?: string;
  email?: string;
  status: CompanyStatus;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  logo?: string;
}

export enum CompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PROSPECT = "prospect",
}

// Export customer journey types
export * from "./customer-journey";

// Export conversion rate types
export * from "./conversion-rate";

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  contactId?: string;
  companyId?: string;
  ownerId: string;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  status: DealStatus;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export enum DealStage {
  PROSPECTING = "prospecting",
  QUALIFICATION = "qualification",
  PROPOSAL = "proposal",
  NEGOTIATION = "negotiation",
  CLOSED_WON = "closed_won",
  CLOSED_LOST = "closed_lost",
}

export enum DealStatus {
  OPEN = "open",
  WON = "won",
  LOST = "lost",
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  relatedToType?: "contact" | "company" | "deal";
  relatedToId?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  userId: string;
  userName: string;
  relatedToType: "contact" | "company" | "deal" | "task";
  relatedToId: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export enum ActivityType {
  EMAIL = "email",
  CALL = "call",
  MEETING = "meeting",
  NOTE = "note",
  STATUS_CHANGE = "status_change",
  CREATED = "created",
  UPDATED = "updated",
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  SALES_REP = "sales_rep",
  USER = "user",
}

export * from "./landing-page";

