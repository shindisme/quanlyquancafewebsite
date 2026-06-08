import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';

interface User { id: string; name: string; role: string; username?: string; email?: string; }

interface Props {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: User | null;
}

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) { setName(initialData.name); setRole(initialData.role as 'ADMIN' | 'STAFF'); setEmail(initialData.email || ''); }
    else { setUsername(''); setEmail(''); setName(''); setRole('STAFF'); }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Vui lòng nhập họ tên'); return; }
    if (name.trim().length < 2) { toast.warning('Họ tên phải có ít nhất 2 ký tự'); return; }
    if (!initialData) {
      if (!username.trim()) { toast.warning('Vui lòng nhập tên đăng nhập'); return; }
      if (username.trim().length < 3) { toast.warning('Tên đăng nhập phải có ít nhất 3 ký tự'); return; }
      if (!email.trim()) { toast.warning('Vui lòng nhập email'); return; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { toast.warning('Email không hợp lệ'); return; }
    }
    try {
      setLoading(true);
      if (initialData) await onSubmit({ name, role });
      else await onSubmit({ username, email, name, role });
      onClose();
    } catch { /* */ }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!initialData ? (
          <>
            <div><label className="admin-label">Tên đăng nhập</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="admin-input" placeholder="Tối thiểu 3 ký tự" /></div>
            <div><label className="admin-label">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" placeholder="email@example.com" /></div>
          </>
        ) : (
          <div><label className="admin-label">Email</label><input type="email" value={email} className="admin-input" readOnly style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }} /></div>
        )}
        <div><label className="admin-label">Họ tên</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="admin-input" placeholder="Tối thiểu 2 ký tự" /></div>
        <div><label className="admin-label">Vai trò</label><select value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'STAFF')} className="admin-select"><option value="STAFF">Nhân viên</option><option value="ADMIN">Admin</option></select></div>
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
