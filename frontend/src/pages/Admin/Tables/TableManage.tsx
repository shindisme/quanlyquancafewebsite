import { useState } from 'react';
import { toast } from 'react-toastify';
import { LayoutGrid, List } from 'lucide-react';
import tableService from '../../../services/tableService';
import areaService from '../../../services/areaService';
import { useFetch } from '../../../hooks/useFetch';
import PageHeader from '../../../components/Admin/ui/PageHeader';
import FilterTabs from '../../../components/Admin/ui/FilterTabs';
import TableList from './TableList';
import TableCardView from './TableCardView';
import TableFormModal from './TableFormModal';
import TableDetailModal from './TableDetailModal';
import ConfirmDeleteModal from '../../../components/Admin/ui/ConfirmDeleteModal';
import ExportConfirmModal from '../../../components/Admin/ui/ExportConfirmModal';
import { exportToExcel } from '../../../utils/exportExcel';

export interface Area { id: string; name: string; }
export interface Table { id: string; name: string; areaId?: string; code: string; isBooked: boolean; area?: { id?: string; name: string; }; }

const TableManage = () => {
  const { data: tables, loading, refetch } = useFetch(tableService);
  const { data: areas } = useFetch(areaService);
  const [filterArea, setFilterArea] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selected, setSelected] = useState<Table | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const areaTabs = [
    { key: 'all', label: 'Tất cả' },
    ...areas.map((a: Area) => ({ key: a.id, label: a.name })),
  ];

  const filtered = tables
    .filter((t: Table) => t.name.toLowerCase().includes(search.toLowerCase()))
    .filter((t: Table) => filterArea === 'all' || t.areaId === filterArea);

  const handleSubmit = async (data: { name: string; areaId: string }) => {
    try {
      if (selected) {
        await tableService.update(selected.id, data);
        toast.success('Cập nhật bàn thành công');
      } else {
        await tableService.create(data);
        toast.success('Thêm bàn thành công');
      }
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    }
  };

  const handleToggleBooked = async (item: Table) => {
    try {
      await tableService.updateBooking(item.id, !item.isBooked);
      toast.success(item.isBooked ? 'Đã chuyển thành Trống' : 'Đã chuyển thành Đang dùng');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setDeleting(true);
      await tableService.remove(selected.id);
      toast.success('Đã xoá bàn');
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
      { key: 'name', label: 'Tên bàn' },
      { key: 'area', label: 'Khu vực', format: (_, item: Table) => item.area?.name ?? '' },
      { key: 'code', label: 'Mã QR' },
      { key: 'isBooked', label: 'Trạng thái', format: (v: boolean) => v ? 'Đang dùng' : 'Trống' },
    ], 'Quan_ly_ban');
  };

  return (
    <div>
      <PageHeader
        title="Quản lý Bàn"
        subtitle="Quản lý bàn theo khu vực"
        onAdd={() => { setSelected(null); setFormOpen(true); }}
        addLabel="Thêm bàn"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm bàn..."
        onExport={() => setExportOpen(true)}
      />

      {/* Filter + View toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <FilterTabs tabs={areaTabs} activeKey={filterArea} onChange={setFilterArea} />
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setViewMode('card')}
            style={{
              width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: viewMode === 'card' ? '#b45309' : '#f1f5f9',
              color: viewMode === 'card' ? 'white' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: viewMode === 'list' ? '#b45309' : '#f1f5f9',
              color: viewMode === 'list' ? 'white' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
      ) : viewMode === 'card' ? (
        <TableCardView
          data={filtered}
          onView={(item) => { setSelected(item); setDetailOpen(true); }}
          onEdit={(item) => { setSelected(item); setFormOpen(true); }}
          onDelete={(item) => { setSelected(item); setDeleteOpen(true); }}
          onToggleBooked={handleToggleBooked}
        />
      ) : (
        <TableList
          data={filtered}
          onView={(item) => { setSelected(item); setDetailOpen(true); }}
          onEdit={(item) => { setSelected(item); setFormOpen(true); }}
          onDelete={(item) => { setSelected(item); setDeleteOpen(true); }}
          onToggleBooked={handleToggleBooked}
        />
      )}

      <TableFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={selected} areas={areas} />
      <TableDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} table={selected} />
      <ConfirmDeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={selected?.name ?? ''} loading={deleting} />
      <ExportConfirmModal isOpen={exportOpen} onClose={() => setExportOpen(false)} onConfirm={handleExport} count={filtered.length} />
    </div>
  );
};

export default TableManage;

