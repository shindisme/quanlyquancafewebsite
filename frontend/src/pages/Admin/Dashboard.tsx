import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Banknote,
  Receipt,
  ShoppingBag,
  Armchair,
  Ticket,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';

interface DashboardStats {
  today: {
    revenue: number;
    invoiceCount: number;
    orderCount: number;
  };
  week: {
    revenue: number;
    invoiceCount: number;
  };
  month: {
    revenue: number;
    invoiceCount: number;
  };
  activeTables: number;
  totalTables: number;
  unpaidInvoices: number;
  topProducts: {
    id: string;
    name: string;
    image?: string;
    price: number;
    totalSold: number;
  }[];
  revenueByDay: {
    date: string;
    revenue: number;
    invoiceCount: number;
  }[];
}

const formatDateLabel = (value: string): string => {
  const date = new Date(
    value.length === 10 ? `${value}T00:00:00` : value,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await dashboardService.getStats();

        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        console.error('Không thể tải thống kê dashboard:', err);

        if (!cancelled) {
          setError('Không tải được dữ liệu thống kê. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  if (loading) {
    return (
      <div
        className="flex justify-center py-20"
        role="status"
        aria-label="Đang tải dữ liệu thống kê"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        role="alert"
        style={{
          padding: 40,
          textAlign: 'center',
          color: '#78716c',
          fontFamily: 'var(--admin-font)',
        }}
      >
        <p>{error || 'Không có dữ liệu thống kê.'}</p>

        <button
          type="button"
          onClick={handleRetry}
          style={{
            marginTop: 16,
            padding: '10px 18px',
            background: '#b45309',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const statCards = [
    {
      id: 'revenue',
      label: 'Doanh thu hôm nay',
      value: formatCurrency(stats.today?.revenue ?? 0),
      icon: <Banknote size={24} strokeWidth={2.2} />,
      color: '#15803d',
      bg: '#dcfce7',
      sub: `Tuần: ${formatCurrency(stats.week?.revenue ?? 0)}`,
    },
    {
      id: 'invoices',
      label: 'Hóa đơn hôm nay',
      value: (stats.today?.invoiceCount ?? 0).toString(),
      icon: <Receipt size={24} strokeWidth={2.2} />,
      color: '#1d4ed8',
      bg: '#dbeafe',
      sub: `Chưa thanh toán: ${stats.unpaidInvoices ?? 0}`,
    },
    {
      id: 'orders',
      label: 'Đơn hàng hôm nay',
      value: (stats.today?.orderCount ?? 0).toString(),
      icon: <ShoppingBag size={24} strokeWidth={2.2} />,
      color: '#b45309',
      bg: '#fef3c7',
      sub: `Tháng: ${stats.month?.invoiceCount ?? 0} hóa đơn`,
    },
    {
      id: 'tables',
      label: 'Bàn đang dùng',
      value: `${stats.activeTables ?? 0}/${stats.totalTables ?? 0}`,
      icon: <Armchair size={24} strokeWidth={2.2} />,
      color: '#dc2626',
      bg: '#fee2e2',
      sub: `${Math.max(
        0,
        (stats.totalTables ?? 0) - (stats.activeTables ?? 0),
      )} bàn trống`,
    },
  ];

  const topProducts = (stats.topProducts || []).slice(0, 5);
  const revenueByDay = stats.revenueByDay || [];

  return (
    <div
      className="animate-fadeIn"
      style={{ fontFamily: 'var(--admin-font)' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#292018',
          }}
        >
          Dashboard
        </h2>

        <p
          style={{
            fontSize: 13,
            color: '#78716c',
            marginTop: 4,
          }}
        >
          Tổng quan hoạt động quán
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.id}
            style={{
              background: '#ffffff',
              padding: '20px 24px',
              border: '1.5px solid #e8e0d8',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              minWidth: 0,
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  color: '#78716c',
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {card.label}
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#292018',
                  lineHeight: 1.3,
                  overflowWrap: 'anywhere',
                }}
              >
                {card.value}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: '#a8a29e',
                  marginTop: 4,
                }}
              >
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Top Products */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: 20,
        }}
      >
        {/* Revenue Chart */}
        <section
          aria-label="Biểu đồ doanh thu"
          style={{
            background: '#ffffff',
            padding: 24,
            border: '1.5px solid #e8e0d8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            minWidth: 0,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#292018',
              marginBottom: 20,
            }}
          >
            Doanh thu 7 ngày
          </h3>

          {revenueByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={revenueByDay}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f0ebe5"
                />

                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tick={{ fill: '#78716c' }}
                  tickFormatter={formatDateLabel}
                />

                <YAxis
                  width={55}
                  fontSize={12}
                  tick={{ fill: '#78716c' }}
                  tickFormatter={(value: number) =>
                    value >= 1000
                      ? `${(value / 1000).toFixed(0)}k`
                      : value.toString()
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value ?? 0)),
                    'Doanh thu',
                  ]}
                  labelFormatter={(label) =>
                    formatDateLabel(String(label))
                  }
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e8e0d8',
                    fontFamily: 'var(--admin-font)',
                    fontSize: 13,
                  }}
                />

                <Bar
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#b45309"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: '#a8a29e',
                fontSize: 14,
              }}
            >
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </section>

        {/* Top Products */}
        <section
          aria-label="Top 5 sản phẩm bán chạy"
          style={{
            background: '#ffffff',
            padding: 24,
            border: '1.5px solid #e8e0d8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            minWidth: 0,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#292018',
              marginBottom: 20,
            }}
          >
            Top 5 bán chạy
          </h3>

          {topProducts.length > 0 ? (
            <div>
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom:
                      index < topProducts.length - 1
                        ? '1px solid #f5f0eb'
                        : 'none',
                  }}
                >
                  {/* Ranking */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background:
                        index < 3
                          ? ['#fef3c7', '#f1f5f9', '#fff7ed'][index]
                          : '#f8fafc',
                      color:
                        index < 3
                          ? ['#d97706', '#64748b', '#ea580c'][index]
                          : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#292018',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={product.name}
                    >
                      {product.name}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: '#a8a29e',
                        marginTop: 2,
                      }}
                    >
                      {formatCurrency(product.price)}
                    </div>
                  </div>

                  {/* Quantity Sold */}
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: '#fef3c7',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#b45309',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {product.totalSold} ly
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: '#a8a29e',
              }}
            >
              <Ticket
                size={32}
                style={{ margin: '0 auto 8px', opacity: 0.3 }}
              />

              <p style={{ fontSize: 13 }}>
                Chưa có dữ liệu
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
