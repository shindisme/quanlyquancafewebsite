import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';

interface Coupon {
  id: string; code: string; discountType: 'PERCENT' | 'VALUE'; discountValue: number;
  minValue?: number; maxDiscount?: number; limit?: number; usedCount?: number;
  isActive?: boolean; startDate: string; endDate?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => Promise<void>; initialData?: Coupon | null; }

const toDateInput = (iso?: string) => iso ? iso.split('T')[0] : '';

const CouponFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'VALUE'>('PERCENT');
  const [discountValue, setDiscountValue] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [limit, setLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setDiscountType(initialData.discountType);
      setDiscountValue(String(initialData.discountValue));
      setMinValue(initialData.minValue ? String(initialData.minValue) : '');
      setMaxDiscount(initialData.maxDiscount ? String(initialData.maxDiscount) : '');
      setLimit(initialData.limit ? String(initialData.limit) : '');
      setIsActive(initialData.isActive ?? true);
      setStartDate(toDateInput(initialData.startDate));
      setEndDate(toDateInput(initialData.endDate));
    } else {
      setCode(''); setDiscountType('PERCENT'); setDiscountValue('');
      setMinValue(''); setMaxDiscount(''); setLimit(''); setIsActive(true);
      setStartDate(''); setEndDate('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate
    if (!code.trim()) { toast.warning('Vui lòng nhập mã coupon'); return; }
    if (code.trim().length < 3) { toast.warning('Mã coupon phải có ít nhất 3 ký tự'); return; }
    if (!discountValue || parseFloat(discountValue) <= 0) { toast.warning('Giá trị giảm giá phải lớn hơn 0'); return; }
    if (discountType === 'PERCENT' && parseFloat(discountValue) > 100) { toast.warning('Phần trăm giảm giá không được vượt quá 100%'); return; }
    if (discountType === 'VALUE' && parseFloat(discountValue) > 10000000) { toast.warning('Giá trị giảm giá tối đa 10.000.000đ'); return; }
    if (minValue && parseInt(minValue) < 0) { toast.warning('Đơn tối thiểu không được âm'); return; }
    if (maxDiscount && parseInt(maxDiscount) <= 0) { toast.warning('Giảm tối đa phải lớn hơn 0'); return; }
    if (limit && parseInt(limit) <= 0) { toast.warning('Số lượt sử dụng phải lớn hơn 0'); return; }
    if (!startDate) { toast.warning('Vui lòng chọn ngày bắt đầu'); return; }
    if (endDate && new Date(endDate) < new Date(startDate)) { toast.warning('Ngày kết thúc phải sau ngày bắt đầu'); return; }

    try {
      setLoading(true);
      await onSubmit({
        code: code.trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minValue: minValue ? parseInt(minValue) : undefined,
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        isActive,
        startDate,
        endDate: endDate || undefined,
      });
      onClose();
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá'} size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="admin-label">Mã coupon</label><input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VD: SUMMER20" className="admin-input" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label className="admin-label">Loại giảm giá</label><select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'PERCENT' | 'VALUE')} className="admin-select"><option value="PERCENT">Phần trăm (%)</option><option value="VALUE">Giá trị (đ)</option></select></div>
          <div><label className="admin-label">Giá trị {discountType === 'PERCENT' ? '(%)' : '(đ)'}</label><input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} min={0} max={discountType === 'PERCENT' ? 100 : 10000000} placeholder={discountType === 'PERCENT' ? '20' : '50000'} className="admin-input" /></div>
          <div><label className="admin-label">Đơn tối thiểu (đ)</label><input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} min={0} placeholder="100000" className="admin-input" /></div>
          <div><label className="admin-label">Giảm tối đa (đ)</label><input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} min={0} placeholder="50000" className="admin-input" /></div>
          <div><label className="admin-label">Giới hạn lượt dùng</label><input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} min={0} placeholder="Không giới hạn" className="admin-input" /></div>
          <div>
            <label className="admin-label">Trạng thái</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 42 }}>
              <button type="button" onClick={() => setIsActive(!isActive)} style={{
                width: 46, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: isActive ? '#16a34a' : '#d6cdc5', position: 'relative',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3,
                  left: isActive ? 25 : 3,
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#16a34a' : '#a8a29e' }}>
                {isActive ? 'Đang hoạt động' : 'Tắt'}
              </span>
            </div>
          </div>
          <div><label className="admin-label">Ngày bắt đầu</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="admin-input" /></div>
          <div><label className="admin-label">Ngày kết thúc</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="admin-input" /></div>
        </div>

        {/* Usage info for editing */}
        {initialData && initialData.usedCount !== undefined && (
          <div style={{
            padding: '8px 14px', borderRadius: 8, background: '#faf8f5', border: '1px solid #e8e0d8',
            fontSize: 12, color: '#78716c', display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Đã sử dụng: <strong style={{ color: '#b45309' }}>{initialData.usedCount}</strong> lượt</span>
            {initialData.limit && <span>Giới hạn: <strong>{initialData.limit}</strong> lượt</span>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default CouponFormModal;
