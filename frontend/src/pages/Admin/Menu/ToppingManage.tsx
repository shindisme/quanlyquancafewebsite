/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { toast } from 'react-toastify';
import toppingService from '../../../services/toppingService';
import toppingGroupService from '../../../services/toppingGroupService';
import { useFetch } from '../../../hooks/useFetch';
import PageHeader from '../../../components/Admin/ui/PageHeader';
import FilterTabs from '../../../components/Admin/ui/FilterTabs';
import ToppingList from './ToppingList';
import ToppingFormModal from './ToppingFormModal';
import ToppingGroupList from './ToppingGroupList';
import ToppingGroupFormModal from './ToppingGroupFormModal';
import ConfirmDeleteModal from '../../../components/Admin/ui/ConfirmDeleteModal';
import ExportConfirmModal from '../../../components/Admin/ui/ExportConfirmModal';
import { exportToExcel } from '../../../utils/exportExcel';

const ToppingManage = () => {
  const [activeTab, setActiveTab] = useState<'toppings' | 'groups'>('toppings');
  const { data: toppings, loading: loadingToppings, refetch: refetchToppings } = useFetch(toppingService);
  const { data: toppingGroups, loading: loadingGroups, refetch: refetchGroups } = useFetch(toppingGroupService);

  const [formOpen, setFormOpen] = useState(false);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [selected, setSelected] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');

  // Filter tabs for Toppings list
  const groupTabs = [
    { key: 'all', label: 'Tất cả' },
    ...toppingGroups.map((g: any) => ({ key: g.id, label: g.name })),
  ];

  const filteredToppings = toppings
    .filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()))
    .filter((t: any) => filterGroup === 'all' || t.groups?.some((g: any) => g.id === filterGroup));

  const filteredGroups = toppingGroups
    .filter((g: any) => g.name.toLowerCase().includes(search.toLowerCase()));

  // Handlers for Topping
  const openCreateTopping = () => { setSelected(null); setFormOpen(true); };
  const openEditTopping = (item: any) => { setSelected(item); setFormOpen(true); };
  const openDeleteTopping = (item: any) => { setSelected(item); setDeleteOpen(true); };

  const handleToppingSubmit = async (formData: any) => {
    try {
      if (selected) {
        await toppingService.update(selected.id, formData);
        toast.success('Cập nhật topping thành công');
      } else {
        await toppingService.create(formData);
        toast.success('Thêm topping thành công');
      }
      refetchToppings();
      refetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    }
  };

  const handleDeleteTopping = async () => {
    if (!selected) return;
    try {
      setDeleting(true);
      await toppingService.remove(selected.id);
      toast.success('Đã xoá topping');
      setDeleteOpen(false);
      refetchToppings();
      refetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  // Handlers for ToppingGroup
  const openCreateGroup = () => { setSelectedGroup(null); setGroupFormOpen(true); };
  const openEditGroup = (item: any) => { setSelectedGroup(item); setGroupFormOpen(true); };
  const openDeleteGroup = (item: any) => { setSelectedGroup(item); setDeleteGroupOpen(true); };

  const handleGroupSubmit = async (formData: any) => {
    try {
      if (selectedGroup) {
        await toppingGroupService.update(selectedGroup.id, formData);
        toast.success('Cập nhật nhóm topping thành công');
      } else {
        await toppingGroupService.create(formData);
        toast.success('Thêm nhóm topping thành công');
      }
      refetchGroups();
      refetchToppings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    try {
      setDeleting(true);
      await toppingGroupService.remove(selectedGroup.id);
      toast.success('Đã xoá nhóm topping');
      setDeleteGroupOpen(false);
      refetchGroups();
      refetchToppings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const fmt = (v: number) => v?.toLocaleString('vi-VN') + 'đ';
    exportToExcel(
      filteredToppings,
      [
        { key: 'name', label: 'Tên topping' },
        { key: 'groups', label: 'Thuộc nhóm', format: (_, item) => item.groups?.map((g: any) => g.name).join(', ') ?? '' },
        { key: 'price', label: 'Giá', format: (v) => fmt(v) },
        { key: 'isActive', label: 'Trạng thái', format: (v) => (v ? 'Hoạt động' : 'Tắt') },
      ],
      'Topping'
    );
  };

  const loading = loadingToppings || loadingGroups;

  return (
    <div>
      <PageHeader
        title="Quản lý Topping & Nhóm Topping"
        subtitle="Quản lý chi tiết topping độc lập và các nhóm topping cho sản phẩm"
        onAdd={activeTab === 'toppings' ? openCreateTopping : openCreateGroup}
        addLabel={activeTab === 'toppings' ? 'Thêm topping' : 'Thêm nhóm topping'}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={activeTab === 'toppings' ? 'Tìm topping...' : 'Tìm nhóm topping...'}
        onExport={activeTab === 'toppings' ? () => setExportOpen(true) : undefined}
      />

      {/* Switcher: Toppings vs Nhóm Topping */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('toppings'); setSearch(''); }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'toppings'
              ? 'bg-amber-700 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Danh mục Topping ({toppings.length})
        </button>
        <button
          onClick={() => { setActiveTab('groups'); setSearch(''); }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'groups'
              ? 'bg-amber-700 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Nhóm Topping ({toppingGroups.length})
        </button>
      </div>

      {activeTab === 'toppings' && (
        <>
          <FilterTabs tabs={groupTabs} activeKey={filterGroup} onChange={setFilterGroup} />
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
            </div>
          ) : (
            <ToppingList data={filteredToppings} onEdit={openEditTopping} onDelete={openDeleteTopping} />
          )}
        </>
      )}

      {activeTab === 'groups' && (
        <>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
            </div>
          ) : (
            <ToppingGroupList data={filteredGroups} onEdit={openEditGroup} onDelete={openDeleteGroup} />
          )}
        </>
      )}

      <ToppingFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleToppingSubmit}
        initialData={selected}
        toppingGroups={toppingGroups}
      />

      <ToppingGroupFormModal
        isOpen={groupFormOpen}
        onClose={() => setGroupFormOpen(false)}
        onSubmit={handleGroupSubmit}
        initialData={selectedGroup}
        allToppings={toppings}
      />

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteTopping}
        itemName={selected?.name ?? ''}
        loading={deleting}
      />

      <ConfirmDeleteModal
        isOpen={deleteGroupOpen}
        onClose={() => setDeleteGroupOpen(false)}
        onConfirm={handleDeleteGroup}
        itemName={selectedGroup?.name ?? ''}
        loading={deleting}
      />

      <ExportConfirmModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onConfirm={handleExport}
        count={filteredToppings.length}
      />
    </div>
  );
};

export default ToppingManage;
