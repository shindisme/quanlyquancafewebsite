import { useState, type ReactNode } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Store, Coffee, Tag, Sparkles,
  Armchair, MapPin, Grid3X3, ShoppingBag, Receipt, UserCheck, BadgePercent,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  showForStaff?: boolean;
}

interface NavGroup {
  label: string;
  icon: ReactNode;
  showForStaff?: boolean;
  children: NavItem[];
}

const allNavGroups: (NavItem | NavGroup)[] = [
  { label: 'Dashboard', path: 'dashboard', icon: <LayoutGrid size={20} strokeWidth={2.2} />, showForStaff: false },
  { label: 'POS Đặt món', path: 'pos', icon: <Store size={20} strokeWidth={2.2} />, showForStaff: true },
  {
    label: 'Quản lý Menu',
    icon: <Coffee size={20} strokeWidth={2.2} />,
    showForStaff: false,
    children: [
      { label: 'Sản phẩm', path: 'products', icon: <Coffee size={17} strokeWidth={2.2} /> },
      { label: 'Danh mục', path: 'categories', icon: <Tag size={17} strokeWidth={2.2} /> },
      { label: 'Topping', path: 'toppings', icon: <Sparkles size={17} strokeWidth={2.2} /> },
    ],
  },
  {
    label: 'Quản lý Bàn',
    icon: <Armchair size={20} strokeWidth={2.2} />,
    showForStaff: true,
    children: [
      { label: 'Khu vực', path: 'areas', icon: <MapPin size={17} strokeWidth={2.2} />, showForStaff: false },
      { label: 'Bàn', path: 'tables', icon: <Grid3X3 size={17} strokeWidth={2.2} />, showForStaff: true },
    ],
  },
  { label: 'Đơn hàng', path: 'orders', icon: <ShoppingBag size={20} strokeWidth={2.2} />, showForStaff: true },
  { label: 'Hoá đơn', path: 'invoices', icon: <Receipt size={20} strokeWidth={2.2} />, showForStaff: true },
  { label: 'Nhân viên', path: 'users', icon: <UserCheck size={20} strokeWidth={2.2} />, showForStaff: false },
  { label: 'Khuyến mãi', path: 'coupons', icon: <BadgePercent size={20} strokeWidth={2.2} />, showForStaff: false },
];

const isNavGroup = (item: NavItem | NavGroup): item is NavGroup => 'children' in item;


function filterByRole(items: (NavItem | NavGroup)[], role: string): (NavItem | NavGroup)[] {
  if (role === 'ADMIN') return items; // admin thấy all
  return items
    .filter(item => {
      if (isNavGroup(item)) return item.showForStaff;
      return item.showForStaff;
    })
    .map(item => {
      if (isNavGroup(item)) {
        return {
          ...item,
          children: item.children.filter(child => child.showForStaff !== false),
        };
      }
      return item;
    });
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role: 'ADMIN' | 'STAFF';
  basePath: string; // '/admin' hoặc '/staff'
  toggled?: boolean;     // Mobile sidebar toggle
  onBackdropClick?: () => void; // Close sidebar on mobile
}

const SidebarComponent = ({ collapsed, onToggle, role, basePath, toggled, onBackdropClick }: SidebarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(['Quản lý Menu', 'Quản lý Bàn']);

  const navGroups = filterByRole(allNavGroups, role);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const sidebarWidth = collapsed ? 80 : 260;
  const title = role === 'ADMIN' ? 'Cafe Admin' : 'Cafe POS';
  const subtitle = role === 'ADMIN' ? 'Management System' : 'Point of Sale';

  return (
    <div
      className="admin-scroll sidebar-root"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: sidebarWidth,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e8e0d8',
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 40,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          padding: collapsed ? '24px 16px' : '24px 20px',
          borderBottom: '1px solid #f0ebe5',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: 'pointer',
          minHeight: 96,
          transition: 'padding 0.25s ease',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #f3c8a7, #0673d9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 16px rgba(6, 115, 217, 0.3)',
        }}>
          <Coffee size={22} color="white" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
            <p style={{ color: '#0f172a', fontSize: 16, fontWeight: 800, fontFamily: 'var(--admin-font)', lineHeight: 1.2 }}>{title}</p>
            <p style={{ color: '#64748b', fontSize: 11, fontFamily: 'var(--admin-font)', marginTop: 3 }}>{subtitle}</p>
          </div>
        )}
      </div>

      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={onBackdropClick}
        breakPoint="md"
        width="100%"
        collapsedWidth="100%"
        backgroundColor="#ffffff"
        rootStyles={{ border: 'none', flex: 1, overflow: 'hidden' }}
      >
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              fontFamily: 'var(--admin-font)',
              fontSize: '13.5px',
              fontWeight: active ? 700 : 500,
              background: active ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important' : 'transparent',
              color: active ? '#ffffff !important' : '#334155',
              borderRadius: '10px',
              margin: '3px 12px',
              padding: '0 14px',
              height: '42px',
              width: 'calc(100% - 24px)',
              transition: 'all 0.15s ease',
              boxShadow: active ? '0 4px 14px rgba(2, 132, 199, 0.32)' : 'none',
              '&:hover': {
                backgroundColor: active ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important' : '#f1f5f9',
                color: active ? '#ffffff !important' : '#0f172a',
              },
            }),
            label: ({ active }) => ({
              color: active ? '#ffffff !important' : '#334155',
              fontWeight: active ? 700 : 500,
            }),
            icon: ({ active }) => ({
              color: active ? '#ffffff !important' : '#64748b',
            }),
          }}
        >
          {navGroups.map((item) => {
            if (isNavGroup(item)) {
              const isGroupActive = item.children.some((c) => pathname === `${basePath}/${c.path}`);
              return (
                <SubMenu
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  open={openMenus.includes(item.label)}
                  onOpenChange={() => toggleMenu(item.label)}
                  rootStyles={{
                    ['& .ps-submenu-content']: {
                      zIndex: 1000,
                      backgroundColor: '#ffffff !important',
                      ...(collapsed ? { boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } : {}),
                    },
                    ['& > .ps-menu-button']: {
                      fontFamily: 'var(--admin-font) !important',
                      color: (isGroupActive ? '#0284c7' : '#334155') + ' !important',
                      fontWeight: isGroupActive ? '700 !important' : '500 !important',
                    },
                    ['& > .ps-menu-button:hover']: {
                      backgroundColor: '#f1f5f9 !important',
                      color: '#0f172a !important',
                    },
                  }}
                >
                  {item.children.map((child) => (
                    <MenuItem
                      key={child.path}
                      icon={child.icon}
                      active={pathname === `${basePath}/${child.path}`}
                      onClick={() => navigate(`${basePath}/${child.path}`)}
                    >
                      {child.label}
                    </MenuItem>
                  ))}
                </SubMenu>
              );
            }
            return (
              <MenuItem
                key={item.path}
                icon={item.icon}
                active={pathname === `${basePath}/${item.path}`}
                onClick={() => navigate(`${basePath}/${item.path}`)}
              >
                {item.label}
              </MenuItem>
            );
          })}
        </Menu>
      </Sidebar>
    </div>
  );
};

export default SidebarComponent;
