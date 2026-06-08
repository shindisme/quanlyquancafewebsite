export const formatCurrency = (amount: number): string =>
  amount.toLocaleString('vi-VN') + 'đ';

/** Format ngày với giờ
 * VD: "2026-04-25T10:30:00Z" → "25/04/2026, 17:30:00"
 */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('vi-VN');

/*Format ngày */
export const formatDateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString('vi-VN');
