import { Pencil, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';

interface Category {
  id: string;
  name: string;
  products?: any[];
}

const columns: Column<Category>[] = [
  { key: 'name', label: 'Tên danh mục', render: (item) => <span className="font-semibold text-slate-800">{item.name}</span> },
  {
    key: 'products', label: 'Số sản phẩm', align: 'center',
    render: (item) => (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-orange-600 text-xs font-bold">
        {item.products?.length ?? 0}
      </span>
    ),
  },
];

interface Props {
  data: Category[];
  onEdit: (item: Category) => void;
  onDelete: (item: Category) => void;
}

const CategoryList = ({ data, onEdit, onDelete }: Props) => (
  <DataTable
    data={data}
    columns={columns}
    emptyMessage="Chưa có danh mục nào"
    actions={(item) => (
      <>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={20} /></button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
      </>
    )}
  />
);

export default CategoryList;
