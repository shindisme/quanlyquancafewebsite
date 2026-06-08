import { ImageOff, Plus } from 'lucide-react';

interface Props {
  product: any;
  onAdd: (product: any) => void;
}

const ProductCard = ({ product, onAdd }: Props) => {
  const sizes = product.sizes || [];
  const sizeText = sizes.length > 0 ? sizes.map((s: any) => s.sizeName).join(' · ') : '';

  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      boxShadow: 'var(--drop-shadow)',
      border: '1px solid #f0ebe5',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      fontFamily: 'var(--admin-font)',
    }}>
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '85%', background: '#f5f0eb', overflow: 'hidden' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, color: '#d6cdc5',
          }}><ImageOff /></div>
        )}
        {!product.isAvailable && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
          }}>Hết hàng</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 14px' }}>
        <p style={{
          fontSize: 13, fontWeight: 700, color: 'var(--text-primary-color)', lineHeight: 1.3,
          height: 34,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>{product.name}</p>

        {sizeText && (
          <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 3, fontWeight: 500 }}>{sizeText}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-orange-color)' }}>
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          <button
            onClick={() => onAdd(product)}
            disabled={product.isAvailable === false}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              background: 'var(--gd-button)',
              color: 'var(--text-primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--inner-shadow)',
              transition: 'transform 0.15s ease',
              opacity: product.isAvailable === false ? 0.4 : 1,
            }}
          >
            <Plus size={16} strokeWidth={3} style={{ textShadow: 'var(--drop-shadow)', color: 'var(--text-primary-color)' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
