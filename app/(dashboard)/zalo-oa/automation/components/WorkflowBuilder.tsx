"use client";

import { FiArrowLeft, FiSave, FiZap, FiGitBranch, FiPlay, FiClock, FiSquare } from "react-icons/fi";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { NodeConfigPanel } from "./NodeConfigPanel";
import type { UseMarketingAutomationReturn } from "../_hooks/useMarketingAutomation";
import type { NodeType } from "../_types";

interface Props {
  hook: UseMarketingAutomationReturn;
}

const NODE_TYPES: { type: NodeType; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { type: "trigger",   label: "Trigger",    icon: <FiZap />,       desc: "Sự kiện kích hoạt", color: "text-blue-600 bg-blue-50" },
  { type: "condition", label: "Điều kiện",  icon: <FiGitBranch />, desc: "Phân nhánh logic",  color: "text-yellow-600 bg-yellow-50" },
  { type: "action",    label: "Hành động",  icon: <FiPlay />,      desc: "Thực hiện action",  color: "text-green-600 bg-green-50" },
  { type: "delay",     label: "Delay",      icon: <FiClock />,     desc: "Dừng chờ thời gian",color: "text-purple-600 bg-purple-50" },
  { type: "end",       label: "Kết thúc",   icon: <FiSquare />,    desc: "Kết thúc luồng",    color: "text-gray-600 bg-gray-50" },
];

export function WorkflowBuilder({ hook }: Props) {
  const { onBack, saveFlow, builderName, setBuilderName, addNode, editingFlow, error } = hook;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <span className="text-gray-300">/</span>
          <input
            value={builderName}
            onChange={(e) => setBuilderName(e.target.value)}
            className="text-base font-semibold text-gray-900 border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none px-1 py-0.5 bg-transparent"
            placeholder="Tên automation..."
          />
          {editingFlow?.trangThai && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              editingFlow.trangThai === "active" ? "bg-green-100 text-green-700" :
              editingFlow.trangThai === "inactive" ? "bg-gray-100 text-gray-600" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {editingFlow.trangThai === "active" ? "Đang hoạt động" : editingFlow.trangThai === "inactive" ? "Tạm dừng" : "Nháp"}
            </span>
          )}
        </div>
        <button
          onClick={saveFlow}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FiSave className="w-4 h-4" />
          Lưu
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Body: toolbar + canvas + config panel */}
      <div className="flex flex-1 border border-gray-200 rounded-xl overflow-hidden bg-white min-h-0">
        {/* Left toolbar: node types */}
        <div className="w-44 border-r border-gray-200 bg-gray-50 p-3 flex flex-col gap-2 shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Thêm node</p>
          {NODE_TYPES.map((nt) => (
            <button
              key={nt.type}
              onClick={() => addNode(nt.type)}
              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm text-left transition-all group"
            >
              <span className={`w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0 ${nt.color}`}>
                {nt.icon}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-primary-700">{nt.label}</p>
                <p className="text-xs text-gray-400 leading-none mt-0.5">{nt.desc}</p>
              </div>
            </button>
          ))}
          <div className="mt-auto pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400 leading-relaxed">
              Nhấn <strong>+</strong> dưới node để kết nối. Kéo node để di chuyển.
            </p>
          </div>
        </div>

        {/* Canvas */}
        <WorkflowCanvas hook={hook} />

        {/* Right: node config */}
        <NodeConfigPanel hook={hook} />
      </div>
    </div>
  );
}
