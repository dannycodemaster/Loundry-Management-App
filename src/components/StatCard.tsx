import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  className?: string;
}

const StatCard = ({ title, value, icon, trend, className = '' }: StatCardProps) => (
  <div className={`rounded-lg border border-border bg-card p-5 animate-fade-in ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold text-card-foreground">{value}</p>
        {trend && <p className="mt-1 text-xs text-success font-medium">{trend}</p>}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;
