'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
}

export default function StatCard({ label, value, icon, change }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-gray-100 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {change && <p className="mt-1 text-xs font-medium text-emerald-600">{change}</p>}
        </div>
        {icon && <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">{icon}</div>}
      </div>
    </div>
  );
}
