import { EClientStatus } from "./enums/client.enums";
import { ESessionStatus, ESessionType } from "./enums/session.enums";
import { EPaymentStatus, EPaymentMethod } from "./enums/payment.enums";
import { EAlertSeverity, EAlertType } from "./enums/alert.enums";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: EClientStatus;
}

export interface Session {
  id: string;
  clientId: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  status: ESessionStatus;
  type: ESessionType;
  notes?: string;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  paymentDate: string;
  status: EPaymentStatus;
  method: EPaymentMethod;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalSessions: number;
  upcomingSessions: number;
  totalPayments: number;
  pendingPayments: number;
  revenue: {
    currentMonth: number;
    previousMonth: number;
  };
}

export interface DashboardAlert {
  id: string;
  type: EAlertType;
  message: string;
  severity: EAlertSeverity;
  timestamp: string;
  read: boolean;
}

export interface DashboardResponse {
  stats: DashboardStats;
  clients: Client[];
  sessions: Session[];
  payments: Payment[];
  alerts: DashboardAlert[];
}
