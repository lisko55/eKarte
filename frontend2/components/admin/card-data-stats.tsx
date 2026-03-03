import React, { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface CardDataStatsProps {
  title: string;
  total: string;
  rate?: string; // Opcionalno: postotak rasta
  levelUp?: boolean; // Je li rast ili pad
  children: ReactNode; // Ikona
}

export const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  rate,
  levelUp,
  children,
}) => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        {/* Ovdje ide ikona s pozadinom */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-primary">
          {children}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white text-2xl">
            {total}
          </h4>
          <span className="text-sm font-medium text-slate-500">{title}</span>
        </div>

        {rate && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              levelUp ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {rate}
            {levelUp ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </span>
        )}
      </div>
    </div>
  );
};
