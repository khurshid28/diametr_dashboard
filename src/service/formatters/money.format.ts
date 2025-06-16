export const formatMoney = (amount?: number): string => {
  if(!amount) return  "";
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
