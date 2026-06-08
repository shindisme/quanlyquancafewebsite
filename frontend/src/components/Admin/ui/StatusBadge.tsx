type Variant = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const variantStyles: Record<Variant, string> = {
  pending: 'text-amber-700',
  confirmed: 'text-blue-700',
  completed: 'text-green-700',
  cancelled: 'text-red-700',
};

const variantLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

interface Props {
  status: string;
}

const StatusBadge = ({ status }: Props) => {
  const key = status.toLowerCase() as Variant;
  const style = variantStyles[key] ?? 'text-slate-600';
  const label = variantLabels[status] ?? status;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
