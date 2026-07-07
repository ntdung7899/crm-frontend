import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { TeamKpiMember } from '@/types/kpi';

interface KpiChartsProps {
    kpis: TeamKpiMember[];
}

const COLORS = {
    COMPLETED: '#10b981',    // emerald-500
    OVERACHIEVED: '#8b5cf6', // purple-500
    IN_PROGRESS: '#0ea5e9',  // sky-500
    FAILED: '#ef4444'        // red-500
};

export function KpiCharts({ kpis }: KpiChartsProps) {
    const kpisWithTarget = useMemo(() => kpis.filter(k => k.target !== null), [kpis]);

    // Prepare data for BarChart (Average Completion Percentage)
    const barData = useMemo(() => {
        return kpisWithTarget.map(kpi => {
            const averageRate = kpi.achievement ? (kpi.achievement.revenue_rate + kpi.achievement.new_customers_rate + kpi.achievement.jobs_completed_rate) / 3 : 0;
            let status = 'IN_PROGRESS';
            if (averageRate >= 120) status = 'OVERACHIEVED';
            else if (averageRate >= 100) status = 'COMPLETED';
            else if (averageRate < 50) status = 'FAILED';

            return {
                name: kpi.full_name.length > 20 ? kpi.full_name.substring(0, 20) + '...' : kpi.full_name,
                fullName: kpi.full_name,
                email: kpi.email,
                'Hoàn thành (%)': Math.min(averageRate, 150), // Cap at 150% for display
                originalPercentage: averageRate.toFixed(1),
                fill: COLORS[status as keyof typeof COLORS] || COLORS.IN_PROGRESS
            };
        }).sort((a, b) => Number(b.originalPercentage) - Number(a.originalPercentage));
    }, [kpisWithTarget]);

    // Prepare data for PieChart (Status Distribution)
    const pieData = useMemo(() => {
        const counts = {
            COMPLETED: 0,
            OVERACHIEVED: 0,
            IN_PROGRESS: 0,
            FAILED: 0
        };
        
        kpisWithTarget.forEach(kpi => {
            const averageRate = kpi.achievement ? (kpi.achievement.revenue_rate + kpi.achievement.new_customers_rate + kpi.achievement.jobs_completed_rate) / 3 : 0;
            if (averageRate >= 120) counts.OVERACHIEVED++;
            else if (averageRate >= 100) counts.COMPLETED++;
            else if (averageRate < 50) counts.FAILED++;
            else counts.IN_PROGRESS++;
        });

        return [
            { name: 'Đạt', value: counts.COMPLETED, color: COLORS.COMPLETED },
            { name: 'Vượt', value: counts.OVERACHIEVED, color: COLORS.OVERACHIEVED },
            { name: 'Đang thực hiện', value: counts.IN_PROGRESS, color: COLORS.IN_PROGRESS },
            { name: 'Không đạt', value: counts.FAILED, color: COLORS.FAILED }
        ].filter(item => item.value > 0);
    }, [kpisWithTarget]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{data.fullName}</p>
                    <p className="text-xs text-gray-500 mb-2">{data.email}</p>
                    <p className="text-sm text-primary-600 font-medium">
                        Tiến độ trung bình: {data.originalPercentage}%
                    </p>
                </div>
            );
        }
        return null;
    };

    if (kpisWithTarget.length === 0) {
        return (
            <div className="p-8 text-center border-b border-gray-100 bg-gray-50/50">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Chưa có dữ liệu thống kê</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                    Hiện tại chưa có nhân sự nào được giao mục tiêu KPI (hoặc dữ liệu chưa được cập nhật). Hãy tiến hành giao mục tiêu để xem biểu đồ thống kê tổng quát.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5 border-b border-gray-100 bg-gray-50/50">
            {/* Bar Chart: Tiến độ các chỉ tiêu */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-base font-semibold text-gray-900 mb-6">Tiến độ nhân sự (Trung bình 3 chỉ số)</h3>
                <div className="w-full overflow-x-auto overflow-y-hidden pb-2">
                    <div style={{ width: barData.length > 6 ? `${barData.length * 100}px` : '100%', height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={barData}
                            margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
                            barSize={32}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#64748b' }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#64748b' }} 
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                            <Bar 
                                dataKey="Hoàn thành (%)" 
                                radius={[4, 4, 0, 0]}
                            >
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pie Chart: Tỷ lệ phân bổ trạng thái */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Trạng thái tổng quan</h3>
                <div className="flex-1 w-full min-h-[280px] relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: any) => [`${value} Nhân sự`, 'Số lượng']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Absolute center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-gray-900">{kpisWithTarget.length}</span>
                        <span className="text-xs text-gray-500">Nhân sự có KPI</span>
                    </div>
                </div>
                
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                    {pieData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-gray-600">{entry.name} <span className="font-medium text-gray-900">({entry.value})</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
