import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { User, Mail, Shield, Calendar, KeyRound, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirm) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!user) return;
    try {
      setLoading(true);
      await userService.changePassword(user.id, newPassword, oldPassword);
      toast.success('Đổi mật khẩu thành công');
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // const initials = user.name
  //   ? user.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
  //   : 'AD';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', fontFamily: 'var(--admin-font)' }}>
      {/* Profile Card */}
      <div style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0',
        marginBottom: 24,
      }}>
        {/* Banner */}
        <div style={{
          height: 120,
          position: 'relative',
        }} />

        {/* Info */}
        <div style={{ padding: '0 32px 32px', marginTop: -40 }}>


          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{user.name}</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            @{user.username} · {user.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
          </p>

          {/* Info grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 16, marginTop: 24,
          }}>
            <InfoRow icon={<User size={16} />} label="Họ tên" value={user.name} />
            <InfoRow icon={<Mail size={16} />} label="Email" value={user.email || '—'} />
            <InfoRow icon={<Shield size={16} />} label="Vai trò" value={user.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'} />
            <InfoRow icon={<Calendar size={16} />} label="Tên đăng nhập" value={user.username} />
          </div>
        </div>
      </div>

      {/* Change Password  */}
      <div style={{
        background: '#fff', borderRadius: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0',
        padding: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(180,83,9,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#b45309',
          }}>
            <KeyRound size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Đổi mật khẩu</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Cập nhật mật khẩu đăng nhập của bạn</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="admin-label">Mật khẩu hiện tại</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại" className="admin-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="admin-label">Mật khẩu mới</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự" className="admin-input" required />
            </div>
            <div>
              <label className="admin-label">Xác nhận mật khẩu</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu mới" className="admin-input" required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px', background: '#fafbfc', borderRadius: 12,
  }}>
    <div style={{ color: '#94a3b8', flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 14, color: '#0f172a', fontWeight: 500, marginTop: 2 }}>{value}</p>
    </div>
  </div>
);

export default ProfilePage;

