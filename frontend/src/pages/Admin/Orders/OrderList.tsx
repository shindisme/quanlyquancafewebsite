import { Eye } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';
import StatusBadge from '../../../components/Admin/ui/StatusBadge';

interface Order {
  id: string;
  code: string;
  subTotal: number;
  status: string;
  createdAt: string;
  invoice?: { code: string; table?: { name: string } };
}

interface Props {
  data: Order[];
  onViewDetail: (item: Order) => void;
  onUpdateStatus: (item: Order) => void;
}

const columns: Column<Order>[] = [
  { key: 'code', label: 'Mã đơn', render: (item) => <code className="font-mono font-bold text-slate-700">{item.code}</code> },
  { key: 'invoice', label: 'Bàn', render: (item) => <span className="text-slate-500">{item.invoice?.table?.name ?? '—'}</span> },
  { key: 'subTotal', label: 'Tổng tiền', align: 'right', render: (item) => <span className="font-semibold text-slate-800">{(item.subTotal ?? 0).toLocaleString('vi-VN')}đ</span> },
  { key: 'status', label: 'Trạng thái', align: 'center', render: (item) => <StatusBadge status={item.status} /> },
  { key: 'createdAt', label: 'Thời gian', render: (item) => <span className="text-slate-400 text-xs">{new Date(item.createdAt).toLocaleString('vi-VN')}</span> },
];

const OrderList = ({ data, onViewDetail, onUpdateStatus }: Props) => (
  <DataTable
    data={data}
    columns={columns}
    emptyMessage="Không có đơn hàng nào"
    actions={(item) => (
      <>
        <button onClick={() => onViewDetail(item)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" title="Xem chi tiết"><Eye size={20} /></button>
        <button onClick={() => onUpdateStatus(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Cập nhật trạng thái"><span className="text-xs font-bold">TT</span></button>
      </>
    )}
  />
);

export default OrderList;
