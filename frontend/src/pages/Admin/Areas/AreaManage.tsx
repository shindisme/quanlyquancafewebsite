/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { toast } from 'react-toastify';
import areaService from '../../../services/areaService';
import { useFetch } from '../../../hooks/useFetch';
import PageHeader from '../../../components/Admin/ui/PageHeader';
import AreaList from './AreaList';
import AreaFormModal from './AreaFormModal';
import ConfirmDeleteModal from '../../../components/Admin/ui/ConfirmDeleteModal';
import ExportConfirmModal from '../../../components/Admin/ui/ExportConfirmModal';
import { exportToExcel } from '../../../utils/exportExcel';

const AreaManage = () => {
  const { data, loading, refetch } = useFetch(areaService);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = data.filter((a: any) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (formData: { name: string }) => {
    try {
      if (selected) {
        await areaService.update(selected.id, formData);
        toast.success('Cập nhật khu vực thành công');
      } else {
        await areaService.create(formData);
        toast.success('Thêm khu vực thành công');
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
      await areaService.remove(selected.id);
      toast.success('Đã xoá khu vực');
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
      { key: 'name', label: 'Tên khu vực' },
    ], 'Khu_vuc');
  };

  return (
    <div>
      <PageHeader
        title="Khu vực"
        subtitle="Quản lý khu vực (tầng, phòng...)"
        onAdd={() => { setSelected(null); setFormOpen(true); }}
        addLabel="Thêm khu vực"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm khu vực..."
        onExport={() => setExportOpen(true)}
      />

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
      ) : (
        <AreaList data={filtered} onEdit={(item) => { setSelected(item); setFormOpen(true); }} onDelete={(item) => { setSelected(item); setDeleteOpen(true); }} />
      )}

      <AreaFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={selected} />
      <ConfirmDeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={selected?.name ?? ''} loading={deleting} />
      <ExportConfirmModal isOpen={exportOpen} onClose={() => setExportOpen(false)} onConfirm={handleExport} count={filtered.length} />
    </div>
  );
};

export default AreaManage;

