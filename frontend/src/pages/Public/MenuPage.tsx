/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, ShoppingCart, History } from 'lucide-react';
import publicService from '../../services/publicService';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/Public/ProductCard';
import AddToCartModal from '../../components/Public/AddToCartModal';
import CartModal from '../../components/Public/CartModal';
import type { TableInfo } from '../../layouts/PublicLayout';

const MenuPage = () => {
  const { table } = useOutletContext<{ table: TableInfo }>();
  const navigate = useNavigate();
  const { totalCount, totalPrice } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      publicService.getProducts(),
      publicService.getCategories(),
      publicService.getToppings(),
    ]).then(([prods, cats, tops]) => {
      setProducts(prods);
      setCategories(cats);
      setToppings(tops);
    }).finally(() => setLoading(false));
  }, []);

  const removeDiacritics = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
  };

  const filtered = useMemo(() => {
    let result = products.filter((p: any) => p.isAvailable !== false);
    if (activeCategory !== 'all') {
      result = result.filter((p: any) => p.categoryId === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = removeDiacritics(searchQuery.toLowerCase());
      result = result.filter((p: any) => removeDiacritics(p.name.toLowerCase()).includes(q));
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate(`/table/${table.code}/checkout`);
  };

  return (
    <div style={{ fontFamily: 'var(--admin-font)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--gd-primary)',
        padding: '16px 16px 0', borderBottom: '1px solid #f0ebe5',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--drop-shadow)',
            }}>
              <span style={{
                fontSize: 18,
                width: 40,
                height: 40,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: 'var(--drop-shadow)',
              }}
              >
                <img src="../../../public/logo.jpg" alt="Logo" />
              </span>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#292018' }}>MENU</p>
              <p style={{ fontSize: 11, color: '#a8a29e', fontWeight: 500 }}>{table.area?.name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => navigate(`/table/${table.code}/tracking`)}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff',
                color: 'var(--text-primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer',
              }}
              title="Lịch sử đơn hàng"
            >
              <History size={16} />
            </button>
            <div style={{
              padding: '8px 16px', borderRadius: 20,
              background: 'var(--gd-button)',
              color: 'var(--text-primary-color)', fontSize: 13, fontWeight: 700,
              boxShadow: 'var(--drop-shadow)',
            }}>{table.name}</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm món..."
            style={{
              width: '100%', padding: '11px 14px 11px 40px', fontSize: 14,
              border: '2px solid #f0ebe5', borderRadius: 12, outline: 'none',
              background: '#faf8f5', color: '#292018', fontFamily: 'var(--admin-font)',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#d97706'; }}
            onBlur={(e) => { e.target.style.borderColor = '#f0ebe5'; }}
          />
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12,
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
              fontFamily: 'var(--admin-font)', transition: 'all 0.2s',
              background: activeCategory === 'all' ? 'linear-gradient(135deg, #b45309, #d97706)' : '#f0ebe5',
              color: activeCategory === 'all' ? '#fff' : '#78716c',
              boxShadow: activeCategory === 'all' ? 'var(--drop-shadow)' : 'none',
            }}
          >Tất cả</button>
          {categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                fontFamily: 'var(--admin-font)', transition: 'all 0.2s',
                background: activeCategory === c.id ? 'linear-gradient(135deg, #b45309, #d97706)' : '#f0ebe5',
                color: activeCategory === c.id ? '#fff' : '#78716c',
                boxShadow: activeCategory === c.id ? '0 3px 10px rgba(180,83,9,0.25)' : 'none',
              }}
            >{c.name}</button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div style={{ padding: '16px', background: 'var(--bg-primary) !important' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e8e0d8', borderTopColor: '#b45309', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e' }}>
            <p style={{ fontSize: 14, fontWeight: 500 }}>Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {filtered.map((p: any) => (
              <ProductCard key={p.id} product={p} onAdd={(prod) => setSelectedProduct(prod)} />
            ))}
          </div>
        )}
      </div>

      {/* footer bar */}
      {totalCount > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, padding: '12px 16px',
          background: '#fff', borderTop: '1px solid #f0ebe5',
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 100,
          boxShadow: '0px -5px 10px rgba(0, 0, 0, 0.1)',
        }}>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              position: 'relative', width: 48, height: 48, borderRadius: 14,
              border: '2px solid #e8e0d8', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary-color)', flexShrink: 0,
            }}
          >
            <ShoppingCart size={22} />

            {/* badge */}
            <span style={{
              position: 'absolute', top: -6, right: -6,
              width: 22, height: 22, borderRadius: '50%',
              background: 'red', color: '#fff',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>{totalCount}</span>
          </button>
          <button
            onClick={handleCheckout}
            style={{
              flex: 1, padding: '14px', borderRadius: 14, border: 'none',
              background: 'var(--gd-button)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--admin-font)',
              boxShadow: 'var(--inner-shadow)',
              color: 'var(--text-primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div className='flex items-center gap-1'
              style={{ textShadow: 'var(--drop-shadow)' }}
            >
              <span>Xác nhận</span>
              <span>-</span>
              <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
          </button>
        </div>
      )}

      <AddToCartModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        toppings={toppings}
      />
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default MenuPage;
