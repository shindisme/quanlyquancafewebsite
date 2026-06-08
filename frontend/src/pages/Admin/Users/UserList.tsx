import { Pencil, Trash2, KeyRound } from 'lucide-react';
import DataTable, { type Column } from '../../../components/Admin/ui/DataTable';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

interface Props {
  data: User[];
  onEdit: (item: User) => void;
  onDelete: (item: User) => void;
  onChangePassword: (item: User) => void;
}

const columns: Column<User>[] = [
  {
    key: 'name', label: 'Họ tên',
    render: (item) => {
      return (
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800">{item.name}</span>
        </div>
      );
    },
  },
  {
    key: 'username',
    label: 'Tài khoản',
    render: (item) => <span className="text-slate-500 font-mono text-xs">{item.username}</span>
  },
  {
    key: 'email',
    label: 'Email',
    render: (item) => <span className="text-slate-500">{item.email}</span>
  },
  {
    key: 'role',
    label: 'Vai trò',
    align: 'center',
    render: (item) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.role === 'ADMIN' ? 'text-amber-700' : 'text-blue-700'}`}>
        {item.role === 'ADMIN' ? 'Admin' : 'Nhân viên'}
      </span>
    ),
  },
];

const UserList = ({ data, onEdit, onDelete, onChangePassword }: Props) => (
  <DataTable
    data={data}
    columns={columns}
    emptyMessage="Chưa có nhân viên nào"
    actions={(item) => (
      <>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={20} /></button>
        <button onClick={() => onChangePassword(item)} className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"><KeyRound size={20} /></button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
      </>
    )}
  />
);

export default UserList;
