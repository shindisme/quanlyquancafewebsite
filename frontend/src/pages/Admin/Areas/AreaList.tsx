import { Pencil, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';

interface Area {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tables?: any[];
}

interface Props {
  data: Area[];
  onEdit: (item: Area) => void;
  onDelete: (item: Area) => void;
}

const columns: Column<Area>[] = [
  { key: 'name', label: 'Tên khu vực', render: (item) => <span className="font-semibold text-slate-800">{item.name}</span> },
  {
    key: 'tables', label: 'Số bàn', align: 'center',
    render: (item) => (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-blue-600 text-xs font-bold">
        {item.tables?.length ?? 0}
      </span>
    ),
  },
];

const AreaList = ({ data, onEdit, onDelete }: Props) => (
  <DataTable
    data={data}
    columns={columns}
    emptyMessage="Chưa có khu vực nào"
    actions={(item) => (
      <>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={20} /></button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
      </>
    )}
  />
);

export default AreaList;
