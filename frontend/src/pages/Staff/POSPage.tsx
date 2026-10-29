import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  ShoppingCart, Minus, Plus, Trash2, Search,
  Table2, Coffee, Send, X, ImageOff,
} from 'lucide-react';
import tableService from '../../services/tableService';
import areaService from '../../services/areaService';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import toppingService from '../../services/toppingService';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import POSProductModal from './POSProductModal';

interface Area { id: string; name: string; }
interface TableItem { id: string; name: string; areaId: string; code: string; isBooked: boolean; area?: Area; }
interface Product { id: string; name: string; price: number; image?: string; description?: string; categoryId: string; isAvailable: boolean; sizes?: Size[]; }
interface Size { id: string; sizeName: string; extraPrice: number; }
interface Category { id: string; name: string; }
interface CartItem {
  product: Product;
  size?: Size;
  quantity: number;
  price: number;
  toppings: { toppingId: string; price: number; name: string }[];
  note?: string;
}

const POSPage = () => {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);

  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [filterArea, setFilterArea] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showTableModal, setShowTableModal] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [t, a, p, c, tp] = await Promise.all([
        tableService.getAll(),
        areaService.getAll(),
        productService.getAll({ limit: 100 }),
        categoryService.getAll(),
        toppingService.getAll(),
      ]);
      setTables(Array.isArray(t) ? t : []);
      setAreas(Array.isArray(a) ? a : []);
      const prodList = Array.isArray(p) ? p : (p?.items || []);
      setProducts(prodList);
      const catList = Array.isArray(c) ? c : (c?.items || []);
      setCategories(catList);
      setToppings(Array.isArray(tp) ? tp : []);
    } catch {
      toast.error('Không tải được dữ liệu');
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const removeDiacritics = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.isAvailable !== false);
    if (filterCategory !== 'all') result = result.filter(p => p.categoryId === filterCategory);
    if (search.trim()) {
      const q = removeDiacritics(search.toLowerCase());
      result = result.filter(p => removeDiacritics(p.name.toLowerCase()).includes(q));
    }
    return result;
  }, [products, filterCategory, search]);

  // Cart logic
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const key = `${item.product.id}-${item.size?.id || ''}-${item.toppings.map(t => t.toppingId).sort().join(',')}`;
      const existIdx = prev.findIndex(c => {
        const ck = `${c.product.id}-${c.size?.id || ''}-${c.toppings.map(t => t.toppingId).sort().join(',')}`;
        return ck === key;
      });
      if (existIdx >= 0) {
        return prev.map((c, i) => i === existIdx ? { ...c, quantity: c.quantity + item.quantity } : c);
      }
      return [...prev, item];
    });
    toast.success(`Đã thêm ${item.product.name}`, { autoClose: 1500 });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = item.quantity + delta;
      if (newQty < 1 || newQty > 99) return item;
      return { ...item, quantity: newQty };
    }));
  };

  const removeItem = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

  const cartTotal = cart.reduce((sum, item) => {
    const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
    return sum + (item.price + toppingTotal) * item.quantity;
  }, 0);

  const handleSubmit = async () => {
    if (!selectedTable) { toast.error('Vui lòng chọn bàn'); return; }
    if (cart.length === 0) { toast.error('Giỏ hàng trống'); return; }
    try {
      setSubmitting(true);
      await api.post('/orders', {
        tableId: selectedTable.id,
        items: cart.map(item => ({
          productId: item.product.id,
          sizeId: item.size?.id,
          quantity: item.quantity,
          price: item.price,
          note: item.note,
          toppings: item.toppings.map(t => ({ toppingId: t.toppingId, price: t.price })),
        })),
      });
      toast.success('Đã tạo đơn hàng!');
      setCart([]);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Tạo đơn thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTables = tables.filter(t => filterArea === 'all' || t.areaId === filterArea);

  // ── Table Selection ──
  if (showTableModal && !selectedTable) {
    return (
      <div className="animate-fadeIn" style={{ fontFamily: 'var(--admin-font)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#292018', marginBottom: 8 }}>
          <Table2 size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Chọn Bàn
        </h2>
        <p style={{ fontSize: 14, color: '#78716c', marginBottom: 24 }}>Chọn bàn để bắt đầu đặt món cho khách</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterArea('all')} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filterArea === 'all' ? '#b45309' : '#f1f5f9', color: filterArea === 'all' ? 'white' : '#64748b',
            fontFamily: 'var(--admin-font)',
          }}>Tất cả</button>
          {areas.map(a => (
            <button key={a.id} onClick={() => setFilterArea(a.id)} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: filterArea === a.id ? '#b45309' : '#f1f5f9', color: filterArea === a.id ? 'white' : '#64748b',
              fontFamily: 'var(--admin-font)',
            }}>{a.name}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {filteredTables.map(t => (
            <button key={t.id} onClick={() => { setSelectedTable(t); setShowTableModal(false); }}
              style={{
                padding: '20px 16px', borderRadius: 0,
                border: '2px solid ' + (t.isBooked ? '#fecaca' : '#dcfce7'),
                background: t.isBooked ? '#fef2f2' : 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', fontFamily: 'var(--admin-font)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
            >
              <Table2 size={28} style={{ margin: '0 auto 8px', color: t.isBooked ? '#dc2626' : '#16a34a' }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#292018' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#78716c', marginTop: 4 }}>{t.area?.name}</div>
              <span style={{
                display: 'inline-block', marginTop: 8, padding: '3px 10px', borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                background: t.isBooked ? '#fee2e2' : '#dcfce7', color: t.isBooked ? '#dc2626' : '#16a34a',
              }}>{t.isBooked ? 'Đang dùng' : 'Trống'}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── POS Layout: Menu + Cart ──
  return (
    <div className="animate-fadeIn" style={{ fontFamily: 'var(--admin-font)', display: 'flex', gap: 24, height: 'calc(100vh - 120px)' }}>
      {/* LEFT — Menu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10, background: '#dcfce7', border: '1px solid #bbf7d0',
          }}>
            <Table2 size={16} color="#16a34a" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{selectedTable?.name}</span>
            <button onClick={() => { setSelectedTable(null); setShowTableModal(true); }}
              style={{
                marginLeft: 4, width: 20, height: 20, borderRadius: '50%',
                border: 'none', background: '#bbf7d0', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={12} color="#16a34a" /></button>
          </div>
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm..."
              style={{
                width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
                border: '1.5px solid #e8e0d8', fontSize: 13, background: 'white',
                outline: 'none', fontFamily: 'var(--admin-font)',
              }}
            />
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCategory('all')} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: 'var(--admin-font)',
            background: filterCategory === 'all' ? 'linear-gradient(135deg, #b45309, #d97706)' : '#f1f5f9',
            color: filterCategory === 'all' ? 'white' : '#64748b',
            boxShadow: filterCategory === 'all' ? '0 3px 10px rgba(180,83,9,0.25)' : 'none',
          }}>Tất cả</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilterCategory(c.id)} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'var(--admin-font)',
              background: filterCategory === c.id ? 'linear-gradient(135deg, #b45309, #d97706)' : '#f1f5f9',
              color: filterCategory === c.id ? 'white' : '#64748b',
              boxShadow: filterCategory === c.id ? '0 3px 10px rgba(180,83,9,0.25)' : 'none',
            }}>{c.name}</button>
          ))}
        </div>

        {/* Product grid */}
        <div className="admin-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
            {filteredProducts.map(p => (
              <button key={p.id} onClick={() => setSelectedProduct(p)}
                style={{
                  padding: 0, borderRadius: 0, border: '1.5px solid #e8e0d8',
                  background: 'white', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s', fontFamily: 'var(--admin-font)', overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b45309'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e0d8'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
              >
                {/* Image */}
                <div style={{ position: 'relative', paddingTop: '70%', background: '#f5f0eb', overflow: 'hidden' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    }}>
                      <ImageOff size={28} color="#d6cdc5" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#292018', lineHeight: 1.3,
                    height: 34, overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>{p.name}</div>
                  {p.sizes && p.sizes.length > 0 && (
                    <div style={{ fontSize: 10, color: '#a8a29e', marginTop: 3, fontWeight: 500 }}>
                      {p.sizes.map(s => s.sizeName).join(' · ')}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#b45309' }}>{formatCurrency(p.price)}</span>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f3c8a7, #0673d9)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><Plus size={14} strokeWidth={3} /></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e' }}>
              <Coffee size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Không tìm thấy sản phẩm</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Cart */}
      <div style={{
        width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'white', borderRadius: 0, border: '1.5px solid #e8e0d8', overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f5f0eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={18} color="#b45309" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#292018' }}>Đơn hàng</span>
          </div>
          <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#fef3c7', color: '#b45309' }}>
            {cart.reduce((s, i) => s + i.quantity, 0)} món
          </span>
        </div>

        <div className="admin-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a8a29e' }}>
              <ShoppingCart size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>Chưa có món nào</p>
            </div>
          ) : cart.map((item, i) => (
            <div key={i} style={{
              padding: '12px 0', borderBottom: i < cart.length - 1 ? '1px solid #f5f0eb' : 'none',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#292018' }}>
                    {item.product.name}
                    {item.size && <span style={{ fontSize: 11, color: '#78716c', marginLeft: 4 }}>({item.size.sizeName})</span>}
                  </div>
                  {item.toppings.length > 0 && (
                    <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>
                      + {item.toppings.map(t => t.name).join(', ')}
                    </div>
                  )}
                  {item.note && <div style={{ fontSize: 11, color: '#78716c', fontStyle: 'italic', marginTop: 2 }}>📝 {item.note}</div>}
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#b45309', marginTop: 4 }}>
                    {formatCurrency((item.price + item.toppings.reduce((s, t) => s + t.price, 0)) * item.quantity)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => updateQuantity(i, -1)} style={{
                    width: 26, height: 26, borderRadius: 6, border: '1px solid #e8e0d8',
                    background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Minus size={12} /></button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#292018', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(i, 1)} style={{
                    width: 26, height: 26, borderRadius: 6, border: '1px solid #e8e0d8',
                    background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Plus size={12} /></button>
                  <button onClick={() => removeItem(i)} style={{
                    width: 26, height: 26, borderRadius: 6, border: 'none', marginLeft: 4,
                    background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Trash2 size={12} color="#dc2626" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #f5f0eb', background: '#faf8f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#57534e' }}>Tổng cộng</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>{formatCurrency(cartTotal)}</span>
          </div>
          <button onClick={handleSubmit} disabled={submitting || cart.length === 0}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--admin-font)',
              background: cart.length === 0 ? '#e8e0d8' : 'linear-gradient(135deg, #f3c8a7, #0673d9)',
              color: 'white', opacity: submitting ? 0.6 : 1,
            }}
          >
            <Send size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            {submitting ? 'Đang gửi...' : 'Gửi đơn hàng'}
          </button>
        </div>
      </div>

      {/* Product Detail Modal */}
      <POSProductModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        toppings={toppings}
        onConfirm={addToCart}
      />
    </div>
  );
};

export default POSPage;
