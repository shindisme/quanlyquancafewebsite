import { useState } from 'react';
import { X, Minus, Plus, Trash2, Edit3, ImageOff } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartModal = ({ isOpen, onClose, onCheckout }: Props) => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalCount } = useCart();
  
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleDecreaseQuantity = (id: string, qty: number) => {
    if (qty <= 1) {
      setConfirmRemoveId(id);
    } else {
      updateQuantity(id, -1);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />

      <div className="animate-slideUp" style={{
        position: 'relative', width: '100%', maxWidth: 430,
        background: '#fff', borderRadius: '24px 24px 0 0',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--admin-font)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px', borderBottom: '1px solid #f0ebe5',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary-color)' }}>Giỏ hàng ({totalCount})</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {items.length > 0 && (
              <button onClick={() => setConfirmClear(true)} style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca',
                background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--admin-font)',
              }}>Xoá tất cả</button>
            )}
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: '#f5f0eb', color: '#78716c', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><X size={16} /></button>
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a8a29e' }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>🛒</p>
              <p style={{ fontSize: 14, fontWeight: 500 }}>Giỏ hàng trống</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => {
                const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
                const unitPrice = item.price + item.extraPrice + toppingTotal;
                return (
                  <div key={item.cartItemId} style={{
                    display: 'flex', gap: 12, padding: '12px',
                    background: '#faf8f5', borderRadius: 14, border: '1px solid #f0ebe5',
                  }}>
                    {/* Image */}
                    <div style={{
                      width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                      background: '#e8e0d8', flexShrink: 0,
                    }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e' }}><ImageOff size={24} /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {item.sizeName && <span style={{ background: '#f0ebe5', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{item.sizeName}</span>}
                        {item.toppings.map((t) => <span key={t.toppingId} style={{ background: '#f0ebe5', padding: '1px 6px', borderRadius: 4 }}>{t.name}</span>)}
                      </div>
                      
                      {item.note && (
                        <div style={{ fontSize: 11, color: 'var(--text-orange-color)', marginTop: 4, background: 'rgba(255, 90, 60, 0.1)', padding: '4px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Edit3 size={12} /> {item.note}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-orange-color)' }}>{(unitPrice * item.quantity).toLocaleString('vi-VN')}đ</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          <button onClick={() => setConfirmRemoveId(item.cartItemId)} style={{
                            width: 28, height: 28, border: 'none', background: '#fef2f2', borderRadius: 6,
                            color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8,
                          }}><Trash2 size={13} /></button>
                          <button onClick={() => handleDecreaseQuantity(item.cartItemId, item.quantity)} style={{
                            width: 28, height: 28, border: '1.5px solid #e8e0d8', background: '#fff', borderRadius: 6,
                            color: '#78716c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}><Minus size={12} /></button>
                          <span style={{ width: 28, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text-primary-color)' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)} style={{
                            width: 28, height: 28, border: '1.5px solid var(--text-orange-color)', background: 'rgba(255, 90, 60, 0.06)', borderRadius: 6,
                            color: 'var(--text-orange-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 20px 20px', borderTop: '1px solid #f0ebe5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: '#78716c', fontWeight: 500 }}>Tổng cộng ({totalCount} món)</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-orange-color)' }}>{totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
            <button onClick={onCheckout} style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              background: 'var(--gd-button)', color: 'var(--text-primary-color)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--admin-font)',
              boxShadow: 'var(--drop-shadow)',
            }}>Xác nhận đơn hàng</button>
          </div>
        )}
      </div>

      {/* Confirmation overlays */}
      {(confirmRemoveId || confirmClear) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div className="animate-scaleIn" style={{
            position: 'relative', width: '85%', maxWidth: 320, background: '#fff',
            borderRadius: 20, padding: 24, textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', fontFamily: 'var(--admin-font)',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary-color)', marginBottom: 8 }}>Xác nhận xoá</h3>
            <p style={{ fontSize: 14, color: '#78716c', marginBottom: 24 }}>
              {confirmClear ? 'Bạn có thật sự muốn xoá tất cả sản phẩm khỏi giỏ hàng?' : 'Bạn có muốn xoá sản phẩm này khỏi giỏ hàng?'}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { setConfirmRemoveId(null); setConfirmClear(false); }}
                style={{ flex: 1, padding: '12px', background: '#f5f0eb', border: 'none', borderRadius: 12, fontWeight: 600, color: '#78716c', cursor: 'pointer' }}
              >Huỷ</button>
              <button 
                onClick={() => {
                  if (confirmClear) { clearCart(); setConfirmClear(false); }
                  if (confirmRemoveId) { removeItem(confirmRemoveId); setConfirmRemoveId(null); }
                }}
                style={{ flex: 1, padding: '12px', background: '#dc2626', border: 'none', borderRadius: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}
              >Xoá</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default CartModal;
