import React from 'react';

// Giả lập biểu đồ đơn giản bằng CSS/SVG để không cần cài thêm thư viện nặng
const ActivityChart: React.FC = () => {
    const data = [30, 45, 20, 60, 50, 80, 65]; // Minutes per day
    const max = Math.max(...data);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[20px] p-6 shadow-sm border border-[#E9EDF7] dark:border-slate-700 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559] dark:text-white">Learning Activity</h3>
                <select className="bg-[#F4F7FE] dark:bg-slate-700 text-[#4318FF] dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-lg border-none outline-none">
                    <option>Weekly</option>
                    <option>Monthly</option>
                </select>
            </div>
            
            <div className="flex items-end justify-between h-48 gap-2">
                {data.map((val, i) => {
                    const height = (val / max) * 100;
                    return (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                            <div className="relative w-full flex justify-center h-full items-end">
                                <div 
                                    className="w-3 md:w-6 rounded-t-lg bg-[#E9EDF7] dark:bg-slate-700 group-hover:bg-[#4318FF] dark:group-hover:bg-blue-500 transition-all duration-300 relative"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1B2559] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {val} mins
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-[#A3AED0] font-medium">{days[i]}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default ActivityChart;