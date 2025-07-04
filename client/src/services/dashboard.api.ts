import { DashboardResponse } from "@/@types/dashboard.type";
import { EClientStatus } from "@/@types/enums/client.enums";
import { ESessionStatus, ESessionType } from "@/@types/enums/session.enums";
import { EPaymentStatus, EPaymentMethod } from "@/@types/enums/payment.enums";
import { EAlertSeverity, EAlertType } from "@/@types/enums/alert.enums";

const BASE_URL = "/api/dashboard";

export const getDashboardStats = async (): Promise<DashboardResponse> => {
  try {
    // For now, using mock data
    return {
      stats: {
        totalClients: 125,
        activeClients: 102,
        totalSessions: 250,
        upcomingSessions: 35,
        totalPayments: 150,
        pendingPayments: 12,
        revenue: {
          currentMonth: 15000,
          previousMonth: 12000
        }
      },
      clients: [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          createdAt: "2025-06-01",
          status: EClientStatus.ACTIVE
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "987-654-3210",
          createdAt: "2025-06-02",
          status: EClientStatus.ACTIVE
        }
      ],
      sessions: [
        {
          id: "1",
          clientId: "1",
          trainerId: "trainer1",
          startTime: "2025-06-29T10:00:00",
          endTime: "2025-06-29T11:00:00",
          status: ESessionStatus.SCHEDULED,
          type: ESessionType.PERSONAL
        }
      ],
      payments: [
        {
          id: "1",
          clientId: "1",
          amount: 150,
          paymentDate: "2025-06-28",
          status: EPaymentStatus.COMPLETED,
          method: EPaymentMethod.CARD
        }
      ],
      alerts: [
        {
          id: "1",
          type: EAlertType.SESSION,
          message: "Upcoming session with John Doe in 1 hour",
          severity: EAlertSeverity.INFO,
          timestamp: "2025-06-29T08:00:00",
          read: false
        },
        {
          id: "2",
          type: EAlertType.PAYMENT,
          message: "Pending payment from Jane Smith",
          severity: EAlertSeverity.WARNING,
          timestamp: "2025-06-29T09:00:00",
          read: false
        }
      ]
    };
  } catch (error) {
    throw error;
  }
};
