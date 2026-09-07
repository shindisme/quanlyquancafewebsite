import { Pencil, Trash2, Eye } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';
import type { Table } from './TableManage';

interface Props {
  data: Table[];
  onView: (item: Table) => void;
  onEdit: (item: Table) => void;
  onDelete: (item: Table) => void;
  onToggleBooked: (item: Table) => void;
}

const columns = (onToggle: (item: Table) => void): Column<Table>[] => [
  { key: 'name', label: 'Tên bàn', render: (item) => <span className="font-semibold text-slate-800">{item.name}</span> },
  { key: 'area', label: 'Khu vực', render: (item) => <span className="text-slate-500">{item.area?.name ?? '—'}</span> },
  {
    key: 'code', label: 'Mã QR',
    render: (item) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">{item.code}</code>,
  },
  {
    key: 'isBooked', label: 'Trạng thái', align: 'center',
    render: (item) => (
      <button
        onClick={() => onToggle(item)}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors ${item.isBooked ? ' text-rose-600 hover:bg-rose-200' : ' text-emerald-600 hover:bg-emerald-200'}`}
      >
        {item.isBooked ? 'Đang dùng' : 'Trống'}
      </button>
    ),
  },
];

const TableList = ({ data, onView, onEdit, onDelete, onToggleBooked }: Props) => (
  <DataTable
    data={data}
    columns={columns(onToggleBooked)}
    emptyMessage="Không có bàn nào"
    actions={(item) => (
      <>
        <button onClick={() => onView(item)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"><Eye size={20} /></button>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={20} /></button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
      </>
    )}
  />
);

export default TableList;
