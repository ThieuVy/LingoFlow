import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`}></div>
  );
};

export const CardSkeleton: React.FC = () => (
    <div className="bg-white p-4 rounded-[20px] shadow-sm border border-[#E9EDF7] h-full">
        <Skeleton className="h-48 w-full mb-4 rounded-2xl" />
        <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-16 w-full" />
        </div>
    </div>
);