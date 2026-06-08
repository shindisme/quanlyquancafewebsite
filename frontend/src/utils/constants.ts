/* Status labels, colors, permissions*/

export const ORDER_STATUS = {
  PENDING: { label: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7' },
  CONFIRMED: { label: 'Đang chuẩn bị', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { label: 'Đã phục vụ', color: '#16a34a', bg: '#dcfce7' },
  CANCELLED: { label: 'Đã huỷ', color: '#dc2626', bg: '#fee2e2' },
} as const;

export const INVOICE_STATUS = {
  UNPAID: { label: 'Chưa thanh toán', color: '#d97706', bg: '#fef3c7' },
  PAID: { label: 'Đã thanh toán', color: '#16a34a', bg: '#dcfce7' },
  CANCELLED: { label: 'Đã huỷ', color: '#dc2626', bg: '#fee2e2' },
} as const;

export const TABLE_STATUS = {
  available: { label: 'Trống', color: '#16a34a', bg: '#dcfce7' },
  occupied: { label: 'Đang dùng', color: '#dc2626', bg: '#fee2e2' },
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS;
export type InvoiceStatusKey = keyof typeof INVOICE_STATUS;
