import { useState } from 'react';
import { toast } from 'react-toastify';
import categoryService from '../../../services/categoryService';
import { useFetch } from '../../../hooks/useFetch';
import PageHeader from '../../../components/Admin/ui/PageHeader';
import CategoryList from './CategoryList';
import CategoryFormModal from './CategoryFormModal';
import ConfirmDeleteModal from '../../../components/Admin/ui/ConfirmDeleteModal';
import ExportConfirmModal from '../../../components/Admin/ui/ExportConfirmModal';
import { exportToExcel } from '../../../utils/exportExcel';

interface Category {
  id: string;
  name: string;
  products?: any[];
}

const CategoryManage = () => {
  const { data, loading, refetch } = useFetch(categoryService);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = data.filter((c: Category) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (item: Category) => { setSelected(item); setFormOpen(true); };
  const openDelete = (item: Category) => { setSelected(item); setDeleteOpen(true); };

  const handleSubmit = async (formData: { name: string }) => {
    try {
      if (selected) {
        await categoryService.update(selected.id, formData);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryService.create(formData);
        toast.success('Thêm danh mục thành công');
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
      await categoryService.remove(selected.id);
      toast.success('Đã xoá danh mục');
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
      { key: 'name', label: 'Tên danh mục' },
      { key: 'products', label: 'Số sản phẩm', format: (_, item) => String(item.products?.length ?? 0) },
    ], 'Danh_muc');
  };

  return (
    <div>
      <PageHeader
        title="Danh mục"
        subtitle="Quản lý danh mục sản phẩm"
        onAdd={openCreate}
        addLabel="Thêm danh mục"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm danh mục..."
        onExport={() => setExportOpen(true)}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : (
        <CategoryList data={filtered} onEdit={openEdit} onDelete={openDelete} />
      )}

      <CategoryFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={selected} />
      <ConfirmDeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={selected?.name ?? ''} loading={deleting} />
      <ExportConfirmModal isOpen={exportOpen} onClose={() => setExportOpen(false)} onConfirm={handleExport} count={filtered.length} />
    </div>
  );
};

export default CategoryManage;

