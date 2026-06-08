import { Pencil, Trash2, ImageOff } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  category?: { name: string };
  sizes?: { sizeName: string; extraPrice: number }[];
}

interface Props {
  data: Product[];
  onEdit: (item: Product) => void;
  onDelete: (item: Product) => void;
}

const fmt = (v: number) => v.toLocaleString('vi-VN') + 'đ';

const columns: Column<Product>[] = [
  {
    key: 'image', label: 'Ảnh', width: '100px',
    render: (item) => item.image
      ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md bg-slate-100 object-cover flex items-center justify-center" />
      : <div className="w-10 h-10  rounded-md bg-slate-100 flex items-center justify-center"><ImageOff size={14} className="text-slate-400" /></div>,
  },
  {
    key: 'name', label: 'Tên sản phẩm',
    render: (item) => (
      <div>
        <p className="font-semibold text-slate-800">{item.name}</p>
        {item.sizes && item.sizes.length > 0 && <p className="text-xs text-slate-400 mt-0.5">{item.sizes.map((s) => s.sizeName).join(', ')}</p>}
      </div>
    ),
  },
  { key: 'category', label: 'Danh mục', render: (item) => <span className="text-slate-500">{item.category?.name ?? '—'}</span> },
  { key: 'price', label: 'Giá', align: 'right', render: (item) => <span className="font-semibold text-slate-700">{fmt(item.price)}</span> },
  {
    key: 'isAvailable', label: 'Trạng thái', align: 'center',
    render: (item) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
        {item.isAvailable ? 'Còn bán' : 'Hết'}
      </span>
    ),
  },
];

const ProductList = ({ data, onEdit, onDelete }: Props) => (
  <DataTable
    data={data}
    columns={columns}
    emptyMessage="Chưa có sản phẩm nào"
    actions={(item) => (
      <>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={20} /></button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
      </>
    )}
  />
);

export default ProductList;
