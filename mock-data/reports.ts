import { GrowthItem, PerformanceItem } from "@/types/reports";

export const growthData: GrowthItem[] = [
  { label: "T2", customers: 34, converted: 9 },
  { label: "T3", customers: 52, converted: 14 },
  { label: "T4", customers: 47, converted: 12 },
  { label: "T5", customers: 69, converted: 20 },
  { label: "T6", customers: 73, converted: 24 },
  { label: "T7", customers: 64, converted: 19 },
  { label: "CN", customers: 58, converted: 17 },
];

export const monthlyGrowthData: GrowthItem[] = [
  { label: "Tuần 1", customers: 120, converted: 40 },
  { label: "Tuần 2", customers: 145, converted: 52 },
  { label: "Tuần 3", customers: 180, converted: 65 },
  { label: "Tuần 4", customers: 165, converted: 58 },
];

export const last30DaysData: GrowthItem[] = [
  { label: "Tuần 1", customers: 100, converted: 30 },
  { label: "Tuần 2", customers: 130, converted: 45 },
  { label: "Tuần 3", customers: 150, converted: 50 },
  { label: "Tuần 4", customers: 160, converted: 60 },
];

export const lastMonthData: GrowthItem[] = [
  { label: "Tuần 1", customers: 90, converted: 25 },
  { label: "Tuần 2", customers: 110, converted: 35 },
  { label: "Tuần 3", customers: 120, converted: 40 },
  { label: "Tuần 4", customers: 140, converted: 48 },
];

export const customRangeData: GrowthItem[] = [
  { label: "Ngày 1", customers: 20, converted: 5 },
  { label: "Ngày 2", customers: 25, converted: 8 },
  { label: "Ngày 3", customers: 30, converted: 12 },
  { label: "Ngày 4", customers: 28, converted: 10 },
  { label: "Ngày 5", customers: 35, converted: 15 },
];

export const performanceData: PerformanceItem[] = [
  { name: "Leader A", closedJobs: 42, responseRate: 93 },
  { name: "Leader B", closedJobs: 37, responseRate: 88 },
  { name: "Thợ 1", closedJobs: 54, responseRate: 90 },
  { name: "Thợ 2", closedJobs: 49, responseRate: 86 },
];
