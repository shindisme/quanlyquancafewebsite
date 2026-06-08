/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { toast } from 'react-toastify';
import toppingService from '../../../services/toppingService';
import categoryService from '../../../services/categoryService';
import { useFetch } from '../../../hooks/useFetch';
import PageHeader from '../../../components/Admin/ui/PageHeader';
import FilterTabs from '../../../components/Admin/ui/FilterTabs';
import ToppingList from './ToppingList';
import ToppingFormModal from './ToppingFormModal';
import ConfirmDeleteModal from '../../../components/Admin/ui/ConfirmDeleteModal';
import ExportConfirmModal from '../../../components/Admin/ui/ExportConfirmModal';
import { exportToExcel } from '../../../utils/exportExcel';

const ToppingManage = () => {
  const { data, loading, refetch } = useFetch(toppingService);
  const { data: categories } = useFetch(categoryService);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categoryTabs = [
    { key: 'all', label: 'Tất cả' },
    ...categories.map((c: any) => ({ key: c.id, label: c.name })),
  ];

  const filtered = data
    .filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()))
    .filter((t: any) => filterCategory === 'all' || t.categoryId === filterCategory);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (item: any) => { setSelected(item); setFormOpen(true); };
  const openDelete = (item: any) => { setSelected(item); setDeleteOpen(true); };

  const handleSubmit = async (formData: any) => {
    try {
      if (selected) {
        await toppingService.update(selected.id, formData);
        toast.success('Cập nhật topping thành công');
      } else {
        await toppingService.create(formData);
        toast.success('Thêm topping thành công');
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
      await toppingService.remove(selected.id);
      toast.success('Đã xoá topping');
      setDeleteOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const fmt = (v: number) => v?.toLocaleString('vi-VN') + 'đ';
    exportToExcel(filtered, [
      { key: 'name', label: 'Tên topping' },
      { key: 'category', label: 'Danh mục', format: (_, item) => item.category?.name ?? '' },
      { key: 'price', label: 'Giá', format: (v) => fmt(v) },
    ], 'Topping');
  };

  return (
    <div>
      <PageHeader
        title="Topping"
        subtitle="Quản lý topping cho đồ uống"
        onAdd={openCreate}
        addLabel="Thêm topping"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm topping..."
        onExport={() => setExportOpen(true)}
      />

      <FilterTabs tabs={categoryTabs} activeKey={filterCategory} onChange={setFilterCategory} />

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
      ) : (
        <ToppingList data={filtered} onEdit={openEdit} onDelete={openDelete} />
      )}

      <ToppingFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={selected} categories={categories} />
      <ConfirmDeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={selected?.name ?? ''} loading={deleting} />
      <ExportConfirmModal isOpen={exportOpen} onClose={() => setExportOpen(false)} onConfirm={handleExport} count={filtered.length} />
    </div>
  );
};

export default ToppingManage;

