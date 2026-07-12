import { TeamKpiResponse, KpiTargetRecord } from "@/types/kpi";

export const mockTeamKpis: TeamKpiResponse = {
  period: {
    type: "month",
    value: 7,
    year: 2026
  },
  team: [
    {
      user_id: "u3",
      full_name: "Lê Hoàng Nam",
      email: "nam.le@example.com",
      avatar: null,
      actual: {
        new_customers: 8,
        customers_assigned: 5,
        jobs_assigned: 20,
        jobs_completed: 18,
        job_completion_rate: 90.0,
        revenue: 45000000
      },
      target: {
        target_revenue: "50000000.00",
        target_new_customers: 10,
        target_jobs_completed: 20,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 90.0,
        new_customers_rate: 80.0,
        jobs_completed_rate: 90.0
      }
    },
    {
      user_id: "u2",
      full_name: "Trần Thị Bích",
      email: "bich.tran@example.com",
      avatar: null,
      actual: {
        new_customers: 12,
        customers_assigned: 6,
        jobs_assigned: 15,
        jobs_completed: 15,
        job_completion_rate: 100.0,
        revenue: 25000000
      },
      target: {
        target_revenue: "20000000.00",
        target_new_customers: 10,
        target_jobs_completed: 15,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 125.0,
        new_customers_rate: 120.0,
        jobs_completed_rate: 100.0
      }
    },
    {
      user_id: "u4",
      full_name: "Phạm Minh Tuấn",
      email: "tuan.pham@example.com",
      avatar: null,
      actual: {
        new_customers: 2,
        customers_assigned: 4,
        jobs_assigned: 10,
        jobs_completed: 5,
        job_completion_rate: 50.0,
        revenue: 5000000
      },
      target: {
        target_revenue: "20000000.00",
        target_new_customers: 10,
        target_jobs_completed: 15,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 25.0,
        new_customers_rate: 20.0,
        jobs_completed_rate: 33.3
      }
    },
    {
      user_id: "u5",
      full_name: "Hoàng Minh Trí",
      email: "tri.hoang@example.com",
      avatar: null,
      actual: {
        new_customers: 5,
        customers_assigned: 5,
        jobs_assigned: 12,
        jobs_completed: 9,
        job_completion_rate: 75.0,
        revenue: 15000000
      },
      target: null, // Chưa được cấu hình mục tiêu
      achievement: null
    },
    {
      user_id: "u6",
      full_name: "Đặng Thanh Sơn",
      email: "son.dang@example.com",
      avatar: null,
      actual: {
        new_customers: 20,
        customers_assigned: 10,
        jobs_assigned: 30,
        jobs_completed: 30,
        job_completion_rate: 100.0,
        revenue: 100000000
      },
      target: {
        target_revenue: "80000000.00",
        target_new_customers: 15,
        target_jobs_completed: 25,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 125.0,
        new_customers_rate: 133.3,
        jobs_completed_rate: 120.0
      }
    },
    {
      user_id: "u7",
      full_name: "Bùi Thị Mai",
      email: "mai.bui@example.com",
      avatar: null,
      actual: {
        new_customers: 1,
        customers_assigned: 5,
        jobs_assigned: 15,
        jobs_completed: 2,
        job_completion_rate: 13.3,
        revenue: 1000000
      },
      target: {
        target_revenue: "30000000.00",
        target_new_customers: 10,
        target_jobs_completed: 20,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 3.3,
        new_customers_rate: 10.0,
        jobs_completed_rate: 10.0
      }
    },
    {
      user_id: "u8",
      full_name: "Vũ Hải Đăng",
      email: "dang.vu@example.com",
      avatar: null,
      actual: {
        new_customers: 9,
        customers_assigned: 10,
        jobs_assigned: 18,
        jobs_completed: 18,
        job_completion_rate: 100.0,
        revenue: 40000000
      },
      target: {
        target_revenue: "40000000.00",
        target_new_customers: 10,
        target_jobs_completed: 20,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 100.0,
        new_customers_rate: 90.0,
        jobs_completed_rate: 90.0
      }
    },
    {
      user_id: "u9",
      full_name: "Lý Thanh Hằng",
      email: "hang.ly@example.com",
      avatar: null,
      actual: {
        new_customers: 15,
        customers_assigned: 10,
        jobs_assigned: 25,
        jobs_completed: 20,
        job_completion_rate: 80.0,
        revenue: 60000000
      },
      target: {
        target_revenue: "50000000.00",
        target_new_customers: 12,
        target_jobs_completed: 25,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 120.0,
        new_customers_rate: 125.0,
        jobs_completed_rate: 80.0
      }
    },
    {
      user_id: "u10",
      full_name: "Ngô Quang Huy",
      email: "huy.ngo@example.com",
      avatar: null,
      actual: {
        new_customers: 4,
        customers_assigned: 8,
        jobs_assigned: 15,
        jobs_completed: 10,
        job_completion_rate: 66.7,
        revenue: 15000000
      },
      target: {
        target_revenue: "35000000.00",
        target_new_customers: 10,
        target_jobs_completed: 20,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 42.8,
        new_customers_rate: 40.0,
        jobs_completed_rate: 50.0
      }
    },
    {
      user_id: "u11",
      full_name: "Đỗ Xuân Trường",
      email: "truong.do@example.com",
      avatar: null,
      actual: {
        new_customers: 0,
        customers_assigned: 0,
        jobs_assigned: 0,
        jobs_completed: 0,
        job_completion_rate: 0,
        revenue: 0
      },
      target: null,
      achievement: null
    },
    {
      user_id: "u12",
      full_name: "Trần Anh Tú",
      email: "tu.tran@example.com",
      avatar: null,
      actual: {
        new_customers: 11,
        customers_assigned: 12,
        jobs_assigned: 20,
        jobs_completed: 20,
        job_completion_rate: 100.0,
        revenue: 55000000
      },
      target: {
        target_revenue: "50000000.00",
        target_new_customers: 10,
        target_jobs_completed: 20,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 110.0,
        new_customers_rate: 110.0,
        jobs_completed_rate: 100.0
      }
    },
    {
      user_id: "u13",
      full_name: "Phan Đình Phùng",
      email: "phung.phan@example.com",
      avatar: null,
      actual: {
        new_customers: 3,
        customers_assigned: 5,
        jobs_assigned: 10,
        jobs_completed: 5,
        job_completion_rate: 50.0,
        revenue: 8000000
      },
      target: {
        target_revenue: "20000000.00",
        target_new_customers: 8,
        target_jobs_completed: 15,
        note: "Target tháng 7"
      },
      achievement: {
        revenue_rate: 40.0,
        new_customers_rate: 37.5,
        jobs_completed_rate: 33.3
      }
    }
  ],
  summary: {
    total_revenue: 90000000,
    total_new_customers: 27
  }
};

export const mockKpiTargetsList: { count: number, rows: KpiTargetRecord[], totalPages: number, currentPage: number } = {
  count: 3,
  rows: [
    {
      id: "1",
      user_id: "u3",
      period_type: "month",
      period_value: 7,
      year: 2026,
      target_revenue: "50000000.00",
      target_new_customers: 10,
      target_jobs_completed: 20,
      note: "Target tháng 7",
      created_by: "admin",
      updated_by: "admin",
      created_at: "2026-07-06T09:48:00.000Z",
      updated_at: "2026-07-06T09:48:00.000Z",
      user: {
        id: "u3",
        full_name: "Lê Hoàng Nam",
        email: "nam.le@example.com",
        avatar: null
      }
    },
    {
      id: "2",
      user_id: "u2",
      period_type: "month",
      period_value: 7,
      year: 2026,
      target_revenue: "20000000.00",
      target_new_customers: 10,
      target_jobs_completed: 15,
      note: "Target tháng 7",
      created_by: "admin",
      updated_by: "admin",
      created_at: "2026-07-06T09:48:00.000Z",
      updated_at: "2026-07-06T09:48:00.000Z",
      user: {
        id: "u2",
        full_name: "Trần Thị Bích",
        email: "bich.tran@example.com",
        avatar: null
      }
    },
    {
      id: "3",
      user_id: "u4",
      period_type: "month",
      period_value: 7,
      year: 2026,
      target_revenue: "20000000.00",
      target_new_customers: 10,
      target_jobs_completed: 15,
      note: "Target tháng 7",
      created_by: "admin",
      updated_by: "admin",
      created_at: "2026-07-06T09:48:00.000Z",
      updated_at: "2026-07-06T09:48:00.000Z",
      user: {
        id: "u4",
        full_name: "Phạm Minh Tuấn",
        email: "tuan.pham@example.com",
        avatar: null
      }
    }
  ],
  totalPages: 1,
  currentPage: 1
};
