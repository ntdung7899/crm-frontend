import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import type { TrendDirection } from "../hooks/useDashboardPage";

type DashboardKpiCard = {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    trendDirection: TrendDirection;
    trendValue: string;
    trendNote: string;
};

type DashboardKpiGridProps = {
    cards: DashboardKpiCard[];
};

export function DashboardKpiGrid({ cards }: DashboardKpiGridProps) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((stat) => {
                const Icon = stat.icon;
                const isUp = stat.trendDirection === "up";
                const TrendIcon = isUp ? FiArrowUpRight : FiArrowDownRight;
                const trendClass = isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600";
                return (
                    <Card key={stat.title} className="p-5">
                        <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <div className={`rounded-xl p-2.5 ${stat.bgColor}`}>
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{stat.value}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ${trendClass}`}>
                                <TrendIcon className="h-3 w-3" />
                                {stat.trendValue}
                            </span>
                            <span className="text-gray-400">{stat.trendNote}</span>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
