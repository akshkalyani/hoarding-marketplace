'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200/50',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200/50',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50',
};

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
