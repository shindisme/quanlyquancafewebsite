import { Pencil, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';
import type { ToppingGroup } from '../../../services/toppingGroupService';

interface Props {
  data: ToppingGroup[];
  onEdit: (item: ToppingGroup) => void;
  onDelete: (item: ToppingGroup) => void;
}

const columns: Column<ToppingGroup>[] = [
  {
    key: 'name',
    label: 'Tên nhóm',
    render: (item) => (
      <div>
        <p className="font-semibold text-slate-800">{item.name}</p>
        {item.description && <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>}
      </div>
    ),
  },
  {
    key: 'toppings',
    label: 'Topping trong nhóm',
    render: (item) => (
      <div className="flex flex-wrap gap-1 max-w-md">
        {item.toppings && item.toppings.length > 0 ? (
          item.toppings.map((t) => (
            <span
              key={t.id}
              className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
            >
              {t.name}
            </span>
          ))
        ) : (
          <span className="text-slate-400 text-xs italic">Trống</span>
        )}
      </div>
    ),
  },
  {
    key: 'count',
    label: 'Đang áp dụng',
    align: 'center',
    render: (item) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800">
        {item._count?.products ?? 0} món
      </span>
    ),
  },
];

const ToppingGroupList = ({ data, onEdit, onDelete }: Props) => (
  <DataTable
    data={data}
    columns={columns}
    emptyMessage="Chưa có nhóm topping nào"
    actions={(item) => (
      <>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
          <Pencil size={20} />
        </button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={20} />
        </button>
      </>
    )}
  />
);

export default ToppingGroupList;
