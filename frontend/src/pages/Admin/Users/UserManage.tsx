import { useState } from 'react';
import { toast } from 'react-toastify';
import userService from '../../../services/userService';
import { useFetch } from '../../../hooks/useFetch';
import PageHeader from '../../../components/Admin/ui/PageHeader';
import FilterTabs from '../../../components/Admin/ui/FilterTabs';
import UserList from './UserList';
import UserFormModal from './UserFormModal';
import UserPasswordModal from './UserPasswordModal';
import ConfirmDeleteModal from '../../../components/Admin/ui/ConfirmDeleteModal';
import ExportConfirmModal from '../../../components/Admin/ui/ExportConfirmModal';
import { exportToExcel } from '../../../utils/exportExcel';

const ROLE_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ADMIN', label: 'Admin' },
  { key: 'STAFF', label: 'Nhân viên' },
];

const UserManage = () => {
  const { data, loading, refetch } = useFetch(userService);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filtered = data
    .filter((u: any) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()))
    .filter((u: any) => filterRole === 'all' || u.role === filterRole);

  const handleSubmit = async (formData: any) => {
    try {
      if (selected) {
        await userService.update(selected.id, formData);
        toast.success('Cập nhật thành công');
      } else {
        await userService.create(formData);
        toast.success('Thêm nhân viên thành công. Mật khẩu mặc định sẽ được gửi qua email.');
      }
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setDeleting(true);
      await userService.remove(selected.id);
      toast.success('Đã xoá nhân viên');
      setDeleteOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    exportToExcel(filtered, [
      { key: 'username', label: 'Tên đăng nhập' },
      { key: 'name', label: 'Họ tên' },
      { key: 'role', label: 'Vai trò', format: (v) => v === 'ADMIN' ? 'Admin' : 'Nhân viên' },
      { key: 'createdAt', label: 'Ngày tạo', format: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '' },
    ], 'Nhan_vien');
  };

  return (
    <div>
      <PageHeader
        title="Nhân viên"
        subtitle="Quản lý tài khoản nhân viên"
        onAdd={() => { setSelected(null); setFormOpen(true); }}
        addLabel="Thêm nhân viên"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm nhân viên..."
        onExport={() => setExportOpen(true)}
      />

      <FilterTabs tabs={ROLE_TABS} activeKey={filterRole} onChange={setFilterRole} />

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
      ) : (
        <UserList
          data={filtered}
          onEdit={(item) => { setSelected(item); setFormOpen(true); }}
          onDelete={(item) => { setSelected(item); setDeleteOpen(true); }}
          onChangePassword={(item) => { setSelected(item); setPwOpen(true); }}
        />
      )}

      <UserFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={selected} />
      <UserPasswordModal isOpen={pwOpen} onClose={() => setPwOpen(false)} userId={selected?.id ?? null} userName={selected?.name ?? ''} />
      <ConfirmDeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={selected?.name ?? ''} loading={deleting} />
      <ExportConfirmModal isOpen={exportOpen} onClose={() => setExportOpen(false)} onConfirm={handleExport} count={filtered.length} />
    </div>
  );
};

export default UserManage;
