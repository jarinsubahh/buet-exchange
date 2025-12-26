export interface User {
  name: string;
  email: string;
  department?: string;
  level?: string;
  term?: string;
  phone?: string;
  isAdmin: boolean;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  type: "sell" | "free";
  category: "pdf" | "book" | "lab_equipment" | "notes" | "other";
  department: string;
  price?: number;
  imageUrl?: string;
  contactInfo: string;
  userId: string;
  userName: string;
  userDepartment: string;
  status: "pending" | "approved" | "sold";
  createdAt: string;
}

export type Department = 
  | "ALL"
  | "CSE"
  | "EEE"
  | "ME"
  | "CE"
  | "ChE"
  | "BME"
  | "IPE"
  | "MME"
  | "NAME"
  | "WRE"
  | "ARCH";

export type Category = "pdf" | "book" | "lab_equipment" | "notes" | "other";
