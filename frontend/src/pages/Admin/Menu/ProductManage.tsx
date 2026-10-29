import { useState } from 'react';
import { toast } from 'react-toastify';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import toppingGroupService from '../../../services/toppingGroupService';
import { useFetch } from '../../../hooks/useFetch';
import PageHeader from '../../../components/Admin/ui/PageHeader';
import Pagination from '../../../components/Admin/ui/Pagination';
import FilterTabs from '../../../components/Admin/ui/FilterTabs';
import ProductList from './ProductList';
import ProductFormModal from './ProductFormModal';
import ConfirmDeleteModal from '../../../components/Admin/ui/ConfirmDeleteModal';
import ExportConfirmModal from '../../../components/Admin/ui/ExportConfirmModal';
import { exportToExcel } from '../../../utils/exportExcel';
import { LoadingState } from '../../../components/ui';

const ProductManage = () => {
  const [page, setPage] = useState(1);
  const { data, meta, loading, refetch } = useFetch(productService, { page, limit: 10 });
  const { data: categories } = useFetch(categoryService);
  const { data: toppingGroups } = useFetch(toppingGroupService);

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
    .filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p: any) => filterCategory === 'all' || p.categoryId === filterCategory);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (item: any) => { setSelected(item); setFormOpen(true); };
  const openDelete = (item: any) => { setSelected(item); setDeleteOpen(true); };

  const handleSubmit = async (formData: any) => {
    try {
      if (selected) {
        await productService.update(selected.id, formData);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.create(formData);
        toast.success('Thêm sản phẩm thành công');
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
      await productService.remove(selected.id);
      toast.success('Đã xoá sản phẩm');
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
      { key: 'name', label: 'Tên sản phẩm' },
      { key: 'category', label: 'Danh mục', format: (_, item) => item.category?.name ?? '' },
      { key: 'price', label: 'Giá', format: (v) => fmt(v) },
      { key: 'isAvailable', label: 'Trạng thái', format: (v) => v ? 'Còn bán' : 'Hết' },
    ], 'San_pham');
  };

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        subtitle="Quản lý menu sản phẩm"
        onAdd={openCreate}
        addLabel="Thêm sản phẩm"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm sản phẩm..."
        onExport={() => setExportOpen(true)}
      />

      <FilterTabs tabs={categoryTabs} activeKey={filterCategory} onChange={setFilterCategory} />

      {loading ? (
        <LoadingState message="Đang tải danh sách sản phẩm..." />
      ) : (
        <>
          <ProductList data={filtered} onEdit={openEdit} onDelete={openDelete} />
          <Pagination currentPage={meta?.currentPage ?? 1} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}

      <ProductFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={selected} categories={categories} toppingGroups={toppingGroups} />
      <ConfirmDeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={selected?.name ?? ''} loading={deleting} />
      <ExportConfirmModal isOpen={exportOpen} onClose={() => setExportOpen(false)} onConfirm={handleExport} count={filtered.length} />
    </div>
  );
};

export default ProductManage;

