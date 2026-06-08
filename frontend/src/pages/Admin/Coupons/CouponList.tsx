import { Pencil, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';

interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'VALUE';
  discountValue: number;
  minValue: number;
  limit?: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

interface Props {
  data: Coupon[];
  onEdit: (item: Coupon) => void;
  onDelete: (item: Coupon) => void;
}

const columns: Column<Coupon>[] = [
  {
    key: 'code', label: 'Mã',
    render: (item) => <code className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{item.code}</code>,
  },
  {
    key: 'discountType', label: 'Loại', align: 'center',
    render: (item) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.discountType === 'PERCENT' ? 'text-blue-700' : 'text-green-700'}`}>
        {item.discountType === 'PERCENT' ? 'Phần trăm' : 'Giá trị'}
      </span>
    ),
  },
  {
    key: 'discountValue', label: 'Giá trị', align: 'right',
    render: (item) => <span className="font-semibold text-slate-700">{item.discountType === 'PERCENT' ? `${item.discountValue}%` : `${item.discountValue.toLocaleString('vi-VN')}đ`}</span>,
  },
  {
    key: 'minValue', label: 'Đơn tối thiểu', align: 'right',
    render: (item) => <span className="text-slate-500">{item.minValue > 0 ? `${item.minValue.toLocaleString('vi-VN')}đ` : '—'}</span>,
  },
  {
    key: 'usedCount', label: 'Đã dùng / Giới hạn', align: 'center',
    render: (item) => (
      <span className="text-xs font-medium">
        <span className="font-bold text-amber-600">{item.usedCount || 0}</span>
        <span className="text-slate-400"> / </span>
        <span className="text-slate-500">{item.limit ?? '∞'}</span>
      </span>
    ),
  },
  {
    key: 'isActive', label: 'Trạng thái', align: 'center',
    render: (item) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
        {item.isActive ? 'Hoạt động' : 'Tắt'}
      </span>
    ),
  },
  { key: 'startDate', label: 'Bắt đầu', render: (item) => <span className="text-slate-500 text-xs">{new Date(item.startDate).toLocaleDateString('vi-VN')}</span> },
  { key: 'endDate', label: 'Kết thúc', render: (item) => <span className="text-slate-500 text-xs">{item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '—'}</span> },
];

const CouponList = ({ data, onEdit, onDelete }: Props) => (
  <DataTable
    data={data}
    columns={columns}
    emptyMessage="Chưa có mã giảm giá nào"
    actions={(item) => (
      <>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={20} /></button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
      </>
    )}
  />
);

export default CouponList;
