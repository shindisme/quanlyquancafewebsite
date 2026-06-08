import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';
import userService from '../../../services/userService';

interface Props { isOpen: boolean; onClose: () => void; userId: string | null; userName: string; }

const UserPasswordModal = ({ isOpen, onClose, userId, userName }: Props) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (newPassword !== confirm) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    if (!userId) return;
    try { setLoading(true); await userService.changePassword(userId, newPassword); toast.success('Đổi mật khẩu thành công'); setNewPassword(''); setConfirm(''); onClose(); }
    catch { toast.error('Đổi mật khẩu thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Đổi mật khẩu — ${userName}`} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="admin-label">Mật khẩu mới</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="admin-input" /></div>
        <div><label className="admin-label">Xác nhận mật khẩu</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="admin-input" /></div>
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1, background: '#f59e0b' }} disabled={loading}>{loading ? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default UserPasswordModal;
