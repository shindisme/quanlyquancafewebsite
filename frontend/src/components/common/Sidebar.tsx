import { useState, type ReactNode } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Coffee, Tag, Layers, MapPin, Table2,
  ClipboardList, Users, Ticket, FileText, ShoppingCart,
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
  { label: 'Dashboard', path: 'dashboard', icon: <LayoutDashboard size={20} />, showForStaff: false },
  { label: 'POS Đặt món', path: 'pos', icon: <ShoppingCart size={20} />, showForStaff: true },
  {
    label: 'Quản lý Menu',
    icon: <Coffee size={20} />,
    showForStaff: false,
    children: [
      { label: 'Sản phẩm', path: 'products', icon: <Coffee size={16} /> },
      { label: 'Danh mục', path: 'categories', icon: <Tag size={16} /> },
      { label: 'Topping', path: 'toppings', icon: <Layers size={16} /> },
    ],
  },
  {
    label: 'Quản lý Bàn',
    icon: <Table2 size={20} />,
    showForStaff: true,
    children: [
      { label: 'Khu vực', path: 'areas', icon: <MapPin size={16} />, showForStaff: false },
      { label: 'Bàn', path: 'tables', icon: <Table2 size={16} />, showForStaff: true },
    ],
  },
  { label: 'Đơn hàng', path: 'orders', icon: <ClipboardList size={20} />, showForStaff: true },
  { label: 'Hoá đơn', path: 'invoices', icon: <FileText size={20} />, showForStaff: true },
  { label: 'Nhân viên', path: 'users', icon: <Users size={20} />, showForStaff: false },
  { label: 'Khuyến mãi', path: 'coupons', icon: <Ticket size={20} />, showForStaff: false },
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
        backgroundColor: '#1c1410',
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
          borderBottom: '1px solid rgba(255,255,255,0.06)',
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
          boxShadow: '0 4px 16px #0673d9',
        }}>
          <Coffee size={22} color="white" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
            <p style={{ color: '#f5f0eb', fontSize: 16, fontWeight: 800, fontFamily: 'var(--admin-font)', lineHeight: 1.2 }}>{title}</p>
            <p style={{ color: '#78716c', fontSize: 11, fontFamily: 'var(--admin-font)', marginTop: 3 }}>{subtitle}</p>
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
        backgroundColor="transparent"
        rootStyles={{ border: 'none', flex: 1, overflow: 'hidden' }}
      >
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              fontFamily: 'var(--admin-font)',
              fontSize: '13.5px',
              fontWeight: active ? 600 : 500,
              background: active ? 'linear-gradient(-135deg, #f3c8a7, #0673d9)' : 'transparent',
              color: active ? '#ff0' : '#a8998e',
              borderRadius: '10px',
              margin: '2px 12px',
              padding: '0 14px',
              height: '42px',
              width: 'calc(100% - 24px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#d6cdc5',
              },
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
                      backgroundColor: '#1c1410 !important',
                    },
                    ['& > .ps-menu-button']: {
                      fontFamily: 'var(--admin-font) !important',
                      color: (isGroupActive ? '#ff0' : '#a8998e') + ' !important',
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
