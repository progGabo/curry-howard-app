export interface ScreenPoint {
  x: number;
  y: number;
}

export function getElementCenter(element: HTMLElement): ScreenPoint {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}