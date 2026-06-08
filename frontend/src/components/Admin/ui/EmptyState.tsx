import { Inbox } from 'lucide-react';

interface Props {
  message?: string;
}

const EmptyState = ({ message = 'Không có dữ liệu' }: Props) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '64px 24px',
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    fontFamily: 'var(--admin-font)',
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: 16,
      background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    }}>
      <Inbox size={28} strokeWidth={1.5} color="#94a3b8" />
    </div>
    <p style={{ fontSize: 15, color: '#94a3b8', fontWeight: 500 }}>{message}</p>
  </div>
);

export default EmptyState;
