"use client";

interface Props {
  active: "automation" | "campaigns";
  onChange: (tab: "automation" | "campaigns") => void;
}

export function AutomationTabBar({ active, onChange }: Props) {
  const tabs = [
    { id: "automation" as const, label: "Marketing automation" },
    // { id: "campaigns" as const, label: "Chiến dịch" },
  ];

  return (
    <div className="flex gap-0 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            active === tab.id
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
