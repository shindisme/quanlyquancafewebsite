import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, FileText, ClipboardList, Table2,
  TrendingUp, Award, Ticket,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';

interface DashboardStats {
  today: { revenue: number; invoiceCount: number; orderCount: number };
  week: { revenue: number; invoiceCount: number };
  month: { revenue: number; invoiceCount: number };
  activeTables: number;
  totalTables: number;
  unpaidInvoices: number;
  topProducts: { id: string; name: string; image?: string; price: number; totalSold: number }[];
  revenueByDay: { date: string; revenue: number; invoiceCount: number }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch { /* empty */ }
      finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#a8a29e', fontFamily: 'var(--admin-font)' }}>
        <p>Không tải được dữ liệu thống kê</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Doanh thu hôm nay',
      value: formatCurrency(stats.today.revenue),
      icon: <DollarSign size={22} />,
      color: '#16a34a', bg: '#dcfce7',
      sub: `Tuần: ${formatCurrency(stats.week.revenue)}`,
    },
    {
      label: 'Hoá đơn hôm nay',
      value: stats.today.invoiceCount.toString(),
      icon: <FileText size={22} />,
      color: '#2563eb', bg: '#dbeafe',
      sub: `Chưa thanh toán: ${stats.unpaidInvoices}`,
    },
    {
      label: 'Đơn hàng hôm nay',
      value: stats.today.orderCount.toString(),
      icon: <ClipboardList size={22} />,
      color: '#d97706', bg: '#fef3c7',
      sub: `Tháng: ${stats.month.invoiceCount} hoá đơn`,
    },
    {
      label: 'Bàn đang dùng',
      value: `${stats.activeTables}/${stats.totalTables}`,
      icon: <Table2 size={22} />,
      color: '#dc2626', bg: '#fee2e2',
      sub: `${stats.totalTables - stats.activeTables} bàn trống`,
    },
  ];

  return (
    <div className="animate-fadeIn" style={{ fontFamily: 'var(--admin-font)' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#292018' }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>Tổng quan hoạt động quán</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 16, padding: '20px 24px',
            border: '1.5px solid #e8e0d8',
            display: 'flex', gap: 16, alignItems: 'center',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: card.bg, color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#78716c', fontWeight: 600, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#292018', lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 4 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Chart + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Revenue Chart */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '24px',
          border: '1.5px solid #e8e0d8',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#292018' }}>Doanh thu 7 ngày</span>
          </div>

          {stats.revenueByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" />
                <XAxis
                  dataKey="date" fontSize={12} tick={{ fill: '#78716c' }}
                />
                <YAxis
                  fontSize={12} tick={{ fill: '#78716c' }}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                  contentStyle={{
                    borderRadius: 10, border: '1px solid #e8e0d8',
                    fontFamily: 'var(--admin-font)', fontSize: 13,
                  }}
                />
                <Bar dataKey="revenue" fill="#b45309" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a8a29e', fontSize: 14 }}>
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Top Products */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '24px',
          border: '1.5px solid #e8e0d8',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#292018' }}>Top 5 bán chạy</span>
          </div>

          {stats.topProducts.length > 0 ? (
            <div>
              {stats.topProducts.map((product, i) => (
                <div key={product.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < stats.topProducts.length - 1 ? '1px solid #f5f0eb' : 'none',
                }}>
                  {/* Ranking badge */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: i < 3 ? ['#fef3c7', '#f1f5f9', '#fff7ed'][i] : '#f8fafc',
                    color: i < 3 ? ['#d97706', '#64748b', '#ea580c'][i] : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#292018' }}>{product.name}</div>
                    <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>{formatCurrency(product.price)}</div>
                  </div>

                  <div style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: '#fef3c7', fontSize: 12, fontWeight: 700, color: '#b45309',
                  }}>
                    {product.totalSold} ly
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a8a29e' }}>
              <Ticket size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
