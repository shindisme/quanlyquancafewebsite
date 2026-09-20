import { Pencil, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';

export interface Topping {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  groups?: { id: string; name: string }[];
}

interface Props {
  data: Topping[];
  onEdit: (item: Topping) => void;
  onDelete: (item: Topping) => void;
}

const columns: Column<Topping>[] = [
  { key: 'name', label: 'Tên topping', render: (item) => <span className="font-semibold text-slate-800">{item.name}</span> },
  {
    key: 'groups',
    label: 'Thuộc nhóm Topping',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        {item.groups && item.groups.length > 0 ? (
          item.groups.map((g) => (
            <span
              key={g.id}
              className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium"
            >
              {g.name}
            </span>
          ))
        ) : (
          <span className="text-slate-400 text-xs italic">Chưa phân nhóm</span>
        )}
      </div>
    ),
  },
  { key: 'price', label: 'Giá', align: 'right', render: (item) => <span className="font-semibold text-slate-700">{item.price.toLocaleString('vi-VN')}đ</span> },
  {
    key: 'isActive', label: 'Trạng thái', align: 'center',
    render: (item) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
        {item.isActive ? 'Hoạt động' : 'Tắt'}
      </span>
    ),
  },
];

const ToppingList = ({ data, onEdit, onDelete }: Props) => (
  <DataTable
    data={data}
    columns={columns}
    emptyMessage="Chưa có topping nào"
    actions={(item) => (
      <>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={20} /></button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
      </>
    )}
  />
);

export default ToppingList;
