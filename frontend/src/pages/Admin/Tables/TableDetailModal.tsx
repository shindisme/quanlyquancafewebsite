import { Download, Link, Layers } from 'lucide-react';
import Modal from '../../../components/Admin/ui/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-toastify';
import type { Table } from './TableManage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
}

const TableDetailModal = ({ isOpen, onClose, table }: Props) => {
  if (!table) return null;

  const url = window.location.origin + '/table/' + table.code;

  const handleDownload = () => {
    const canvas = document.getElementById('qr-modal-' + table.code) as HTMLCanvasElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${table.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.success('Đã copy đường dẫn!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Bàn" size="xl">
      <div style={{ fontFamily: 'var(--admin-font)', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Infor */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>{table.name}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <Layers size={16} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>Khu vực</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{table.area?.name ?? '—'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: table.isBooked ? '#fef2f2' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: table.isBooked ? '#ef4444' : '#10b981' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'currentColor' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>Trạng thái</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{table.isBooked ? 'Đang sử dụng' : 'Bàn trống'}</p>
                </div>
              </div>
            </div>

            {/* URL */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed #e2e8f0' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Đường dẫn Menu cho khách:</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {url}
                </div>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  style={{ width: 40, height: 38, borderRadius: 8, border: '1.5px solid #16a34a', background: '#fff', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Copy đường dẫn"
                >
                  <Link size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#fff', padding: 8, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <QRCodeCanvas
                id={'qr-modal-' + table.code}
                value={url}
                size={140}
                level="M"
              />
            </div>
            <button
              onClick={handleDownload}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10, border: 'none',
                background: '#16a34a', color: '#fff', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, width: '100%', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
              }}
            >
              <Download size={14} /> Tải mã QR
            </button>
          </div>

        </div>
      </div>
    </Modal>
  );
};

export default TableDetailModal;
