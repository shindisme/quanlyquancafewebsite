
export const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

export const matchVietnamese = (text: string, query: string): boolean => {
  if (!query) return true;
  if (!text) return false;
  const normalizedText = removeVietnameseTones(text);
  const normalizedQuery = removeVietnameseTones(query);
  return normalizedText.includes(normalizedQuery);
};
