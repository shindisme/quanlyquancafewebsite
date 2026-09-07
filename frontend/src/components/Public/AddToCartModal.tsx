import { useState, useEffect, type FC } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  toppings: any[];
}

const AddToCartModal = ({ isOpen, onClose, product, toppings }: Props) => {
  const { addItem } = useCart();
  const sizes = product?.sizes || [];
  const categoryToppings = toppings.filter((t: any) => t.categoryId === product?.categoryId);

  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      setSelectedSize(sizes.length > 0 ? sizes[0] : null);
      setSelectedToppings([]);
      setQuantity(1);
      setNote('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toppingTotal = categoryToppings
    .filter((t: any) => selectedToppings.includes(t.id))
    .reduce((s: number, t: any) => s + t.price, 0);

  const unitPrice = product.price + (selectedSize?.extraPrice || 0) + toppingTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      sizeId: selectedSize?.id,
      sizeName: selectedSize?.sizeName,
      extraPrice: selectedSize?.extraPrice || 0,
      toppings: categoryToppings
        .filter((t: any) => selectedToppings.includes(t.id))
        .map((t: any) => ({ toppingId: t.id, name: t.name, price: t.price })),
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />

      <div className="animate-slideUp" style={{
        position: 'relative', width: '100%', maxWidth: 430,
        background: '#fff', borderRadius: '24px 24px 0 0',
        maxHeight: '85vh', overflowY: 'auto',
        fontFamily: 'var(--admin-font)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Product header */}
        <div style={{ position: 'relative' }}>
          {product.image && (
            <div style={{ height: 200, overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 20px 24px' }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#292018', marginBottom: 4 }}>{product.name}</h3>
          {product.description && <p style={{ fontSize: 13, color: '#78716c', marginBottom: 4 }}>{product.description}</p>}
          <p style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>{product.price.toLocaleString('vi-VN')}đ</p>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#292018', marginBottom: 10 }}>Kích cỡ</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {sizes.map((s: any) => (
                  <label
                    key={s.id}
                    style={{
                      flex: 1, minWidth: 80, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      border: selectedSize?.id === s.id ? '2px solid #b45309' : '2px solid #e8e0d8',
                      background: selectedSize?.id === s.id ? 'rgba(180,83,9,0.06)' : '#fff',
                      textAlign: 'center', transition: 'all 0.15s',
                    }}
                  >
                    <input type="radio" name="size" checked={selectedSize?.id === s.id} onChange={() => setSelectedSize(s)} style={{ display: 'none' }} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#292018' }}>{s.sizeName}</p>
                    {s.extraPrice > 0 && <p style={{ fontSize: 11, color: '#b45309', marginTop: 2, fontWeight: 600 }}>+{s.extraPrice.toLocaleString('vi-VN')}đ</p>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Toppings */}
          {categoryToppings.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#292018', marginBottom: 10 }}>Topping</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categoryToppings.map((t: any) => (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      border: selectedToppings.includes(t.id) ? '2px solid #b45309' : '2px solid #e8e0d8',
                      background: selectedToppings.includes(t.id) ? 'rgba(180,83,9,0.06)' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        border: selectedToppings.includes(t.id) ? '2px solid #b45309' : '2px solid #d6cdc5',
                        background: selectedToppings.includes(t.id) ? '#b45309' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {selectedToppings.includes(t.id) && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                      </div>
                      <input type="checkbox" checked={selectedToppings.includes(t.id)} onChange={() => toggleTopping(t.id)} style={{ display: 'none' }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292018' }}>{t.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#b45309' }}>+{t.price.toLocaleString('vi-VN')}đ</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#292018' }}>Số lượng</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#f5f0eb', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{
                width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716c',
              }}><Minus size={16} /></button>
              <span style={{ width: 40, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--text-primary-color)' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{
                width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-orange-color)',
              }}><Plus size={16} /></button>
            </div>
          </div>

          {/* Note */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary-color)', marginBottom: 10 }}>Ghi chú</p>
            <textarea
              placeholder="Ít đá, nhiều đường..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #e8e0d8',
                background: '#faf8f5', fontSize: 14, color: 'var(--text-primary-color)', outline: 'none',
                fontFamily: 'var(--admin-font)', resize: 'none', height: 80, transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--text-orange-color)'}
              onBlur={(e) => e.target.style.borderColor = '#e8e0d8'}
            />
          </div>

          {/* Confirm */}
          <button onClick={handleConfirm} style={{
            width: '100%', marginTop: 24, padding: '16px', borderRadius: 14, border: 'none',
            background: 'var(--gd-button)', color: 'var(--text-primary-color)',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--admin-font)',
            boxShadow: 'var(--drop-shadow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span>Thêm vào giỏ</span>
            <span>·</span>
            <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AddToCartModal;
