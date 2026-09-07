export const formatCurrency = (amount: number): string =>
  amount.toLocaleString('vi-VN') + 'đ';

/** Format ngày với giờ */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('vi-VN');

/*Format ngày */
export const formatDateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString('vi-VN');
