/**
 * 生成数字分页按钮用的 1-based 页码列表（滑动窗口，避免页数过多时铺满一行）。
 */
export function getPageNumbers(currentPage: number, totalPages: number, maxVisible = 7): number[] {
  const total = Math.max(0, Math.floor(totalPages));
  if (total <= 0) return [];
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const current = Math.min(Math.max(1, Math.floor(currentPage)), total);
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
