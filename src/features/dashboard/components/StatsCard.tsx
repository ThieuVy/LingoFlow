import React from 'react';

interface StatsCardProps {
    label: string;
    value: number | string;
    unit?: string;
    icon: string;
    color: string;
    bg: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, unit, icon, color, bg }) => {
    return (
        <div className="bg-white rounded-[20px] p-6 shadow-[0_20px_50px_rgba(8,112,184,0.07)] hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${bg} ${color}`}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
                </div>
                <div>
                    <p className="text-sm text-[#A3AED0] font-medium">{label}</p>
                    <h4 className="text-2xl font-bold text-[#1B2559]">
                        {value} <span className="text-xs text-[#A3AED0] font-normal">{unit}</span>
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;