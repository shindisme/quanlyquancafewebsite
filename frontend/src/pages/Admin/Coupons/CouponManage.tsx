/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { toast } from 'react-toastify';
import couponService from '../../../services/couponService';
import { useFetch } from '../../../hooks/useFetch';
import PageHeader from '../../../components/Admin/ui/PageHeader';
import FilterTabs from '../../../components/Admin/ui/FilterTabs';
import CouponList from './CouponList';
import CouponFormModal from './CouponFormModal';
import ConfirmDeleteModal from '../../../components/Admin/ui/ConfirmDeleteModal';
import ExportConfirmModal from '../../../components/Admin/ui/ExportConfirmModal';
import { exportToExcel } from '../../../utils/exportExcel';

const TYPE_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'PERCENT', label: 'Phần trăm (%)' },
  { key: 'VALUE', label: 'Giá trị (đ)' },
];

const CouponManage = () => {
  const { data, loading, refetch } = useFetch(couponService);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = data
    .filter((c: any) => c.code?.toLowerCase().includes(search.toLowerCase()))
    .filter((c: any) => filterType === 'all' || c.discountType === filterType);

  const handleSubmit = async (formData: any) => {
    try {
      if (selected) {
        await couponService.update(selected.id, formData);
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await couponService.create(formData);
        toast.success('Thêm mã giảm giá thành công');
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
      await couponService.remove(selected.id);
      toast.success('Đã xoá mã giảm giá');
      setDeleteOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const fmt = (v: number) => v?.toLocaleString('vi-VN');
    exportToExcel(filtered, [
      { key: 'code', label: 'Mã coupon' },
      { key: 'discountType', label: 'Loại', format: (v) => v === 'PERCENT' ? 'Phần trăm' : 'Giá trị' },
      { key: 'discountValue', label: 'Giá trị', format: (v, item) => item.discountType === 'PERCENT' ? `${v}%` : fmt(v) + 'đ' },
      { key: 'minValue', label: 'Đơn tối thiểu', format: (v) => v ? fmt(v) + 'đ' : '' },
      { key: 'startDate', label: 'Bắt đầu', format: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '' },
      { key: 'endDate', label: 'Kết thúc', format: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : 'Không giới hạn' },
    ], 'Khuyen_mai');
  };

  return (
    <div>
      <PageHeader
        title="Khuyến mãi"
        subtitle="Quản lý mã giảm giá"
        onAdd={() => { setSelected(null); setFormOpen(true); }}
        addLabel="Thêm mã"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã coupon..."
        onExport={() => setExportOpen(true)}
      />

      <FilterTabs tabs={TYPE_TABS} activeKey={filterType} onChange={setFilterType} />

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
      ) : (
        <CouponList data={filtered} onEdit={(item) => { setSelected(item); setFormOpen(true); }} onDelete={(item) => { setSelected(item); setDeleteOpen(true); }} />
      )}

      <CouponFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={selected} />
      <ConfirmDeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={selected?.code ?? ''} loading={deleting} />
      <ExportConfirmModal isOpen={exportOpen} onClose={() => setExportOpen(false)} onConfirm={handleExport} count={filtered.length} />
    </div>
  );
};

export default CouponManage;

