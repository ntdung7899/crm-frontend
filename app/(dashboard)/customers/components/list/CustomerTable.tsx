"use client";

import { Customer, CustomerStatus } from "@/types/customer";
import { formatDateVN } from "@/lib/utils";
import { FiEdit2, FiEye, FiMoreHorizontal, FiUser } from "react-icons/fi";
import { useState } from "react";

interface CustomerTableProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
  onCustomerEdit?: (customer: Customer) => void;
  onCustomerDelete?: (customer: Customer) => void;
}

type SortField = keyof Customer | null;
type SortDirection = "asc" | "desc";

const STATUS_LABELS: Record<CustomerStatus, { label: string; className: string }> = {
  [CustomerStatus.REGISTERED]: { label: "Khách hàng", className: "bg-emerald-50 text-emerald-600" },
  [CustomerStatus.NOT_CONTACTED]: { label: "Chưa liên hệ", className: "bg-gray-100 text-gray-600" },
  [CustomerStatus.NEW]: { label: "Tiềm năng", className: "bg-amber-50 text-amber-600" },
  [CustomerStatus.CONTACTED]: { label: "Đã liên hệ", className: "bg-blue-50 text-blue-600" },
  [CustomerStatus.QUOTED]: { label: "Đã báo giá", className: "bg-purple-50 text-purple-600" },
  [CustomerStatus.TESTED]: { label: "Đã test", className: "bg-cyan-50 text-cyan-600" },
  [CustomerStatus.CONSIDERING]: { label: "Đang cân nhắc", className: "bg-yellow-50 text-yellow-600" },
  [CustomerStatus.UPSELL]: { label: "Upsell", className: "bg-pink-50 text-pink-600" },
  [CustomerStatus.APPROACHED]: { label: "Đã tiếp cận", className: "bg-indigo-50 text-indigo-600" },
  [CustomerStatus.SURVEYED]: { label: "Đã khảo sát", className: "bg-teal-50 text-teal-600" },
};

export function CustomerTable({
  customers,
  onCustomerClick,
  onCustomerEdit,
}: CustomerTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortField) return 0;

    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px]">
        <thead className="border-b border-gray-100 bg-gray-50/80">
          <tr>
            <TableHeader label="Khách hàng" field="customerName" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Số điện thoại" field="mobilePhone" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Nhóm khách hàng" field="relationship" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Nguồn khách hàng" field="customerSource" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Người phụ trách" field="assignee" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Trạng thái" field="status" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Ngày tạo" field="createdDate" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedCustomers.map((customer) => (
            <CustomerTableRow
              key={customer.id}
              customer={customer}
              onView={onCustomerClick}
              onEdit={onCustomerEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TableHeaderProps {
  label: string;
  field: SortField;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
}

function TableHeader({ label, field, onSort, sortField, sortDirection }: TableHeaderProps) {
  const isSorted = sortField === field;

  return (
    <th
      className="cursor-pointer px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 transition hover:bg-gray-100"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isSorted && <span className="text-primary-600">{sortDirection === "asc" ? "↑" : "↓"}</span>}
      </div>
    </th>
  );
}

interface CustomerTableRowProps {
  customer: Customer;
  onView?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
}

function CustomerTableRow({ customer, onView, onEdit }: CustomerTableRowProps) {
  const phone = customer.mobilePhone || customer.phone || "-";
  const firstGroup = customer.groups?.[0] || "Chưa nhóm";
  const source = customer.customerSource || customer.source || customer.website || "Zalo OA";
  const assignee = customer.assignee?.trim() || "Chưa phân công";
  const status = customer.groups?.some((group) => group.toLowerCase().includes("tiềm năng"))
    ? { label: "Tiềm năng", className: "bg-amber-50 text-amber-600" }
    : STATUS_LABELS[customer.status] || STATUS_LABELS[CustomerStatus.REGISTERED];

  return (
    <tr className="transition-colors hover:bg-gray-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
            {getInitials(customer.customerName)}
          </div>
          <span className="text-sm font-semibold text-gray-900">{customer.customerName}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-sm font-medium text-gray-700">{phone}</td>
      <td className="px-5 py-4"><Badge className="bg-primary-50 text-primary-600" label={firstGroup} /></td>
      <td className="px-5 py-4"><Badge className={sourceBadgeClass(source)} label={source} /></td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          <FiUser className="h-3.5 w-3.5" />
          {assignee}
        </span>
      </td>
      <td className="px-5 py-4"><Badge className={status.className} label={status.label} /></td>
      <td className="px-5 py-4 text-sm leading-5 text-gray-600 whitespace-pre-line">{formatDateVN(customer.createdDate)}</td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => onView?.(customer)} className="text-primary-600 transition hover:text-primary-700" title="Xem chi tiết">
            <FiEye className="h-4 w-4" />
          </button>
          <button onClick={() => onEdit?.(customer)} className="text-gray-500 transition hover:text-gray-700" title="Chỉnh sửa">
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button className="text-gray-500 transition hover:text-gray-700" title="Thêm thao tác">
            <FiMoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Badge({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "KH";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function sourceBadgeClass(source: string) {
  const normalized = source.toLowerCase();
  if (normalized.includes("zalo")) return "bg-sky-50 text-sky-600";
  if (normalized.includes("website")) return "bg-emerald-50 text-emerald-600";
  if (normalized.includes("facebook")) return "bg-blue-50 text-blue-600";
  if (normalized.includes("giới") || normalized.includes("gioi")) return "bg-primary-50 text-primary-600";
  return "bg-gray-100 text-gray-600";
}
