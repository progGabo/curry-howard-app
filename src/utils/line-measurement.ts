import { ElementRef } from '@angular/core';

export interface LineMeasurement {
  lineWidthPx: number | null;
  lineOffsetPx: number;
}

export interface LineMeasurementHost {
  conclusionEl?: ElementRef<HTMLElement>;
  childrenEl?: ElementRef<HTMLElement>;
  lineWidthPx: number | null;
  lineOffsetPx: number;
}

export function getOwnFormulaBounds(
  host: HTMLElement,
  relativeTo: HTMLElement,
  formulaSelector: string
): { left: number; right: number; width: number } {
  const main = host.firstElementChild as HTMLElement | null;
  const treeNode = main?.firstElementChild as HTMLElement | null;
  if (!treeNode) {
    return {
      left: host.offsetLeft,
      right: host.offsetLeft + host.offsetWidth,
      width: host.offsetWidth
    };
  }

  const ownConclusion = Array.from(treeNode.children).find((child) =>
    (child as HTMLElement).classList.contains('conclusion')
  ) as HTMLElement | undefined;

  if (!ownConclusion) {
    return {
      left: host.offsetLeft,
      right: host.offsetLeft + host.offsetWidth,
      width: host.offsetWidth
    };
  }

  const formulaEl = ownConclusion.querySelector(formulaSelector) as HTMLElement | null;
  const targetEl = formulaEl ?? ownConclusion;
  const containerRect = relativeTo.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  const scaleX = targetEl.offsetWidth > 0 ? (targetRect.width / targetEl.offsetWidth) : 1;
  const safeScaleX = scaleX > 0 ? scaleX : 1;
  const left = (targetRect.left - containerRect.left) / safeScaleX;
  const width = targetRect.width / safeScaleX;
  const right = left + width;

  return {
    left,
    right,
    width: Math.max(0, width)
  };
}

export function updateLineWidth(component: LineMeasurementHost, formulaSelector: string): void {
  const conclusionEl = component.conclusionEl?.nativeElement;
  const formulaEl = conclusionEl?.querySelector(formulaSelector) as HTMLElement | null;
  const conclusionWidth = conclusionEl?.offsetWidth ?? 0;
  const ownFormulaWidth = formulaEl?.offsetWidth ?? conclusionWidth;
  const childrenContainer = component.childrenEl?.nativeElement;
  component.lineOffsetPx = 0;

  if (!childrenContainer) {
    component.lineWidthPx = ownFormulaWidth;
    return;
  }

  const childHosts = Array.from(childrenContainer.children) as HTMLElement[];
  if (childHosts.length === 0) {
    component.lineWidthPx = ownFormulaWidth;
    return;
  }

  if (childHosts.length === 1) {
    const child = getOwnFormulaBounds(childHosts[0], childrenContainer, formulaSelector);
    component.lineWidthPx = Math.max(ownFormulaWidth, child.width);
    return;
  }

  if (!conclusionEl) {
    component.lineWidthPx = childrenContainer.offsetWidth;
    return;
  }

  const childBounds = childHosts.map((host) => getOwnFormulaBounds(host, childrenContainer, formulaSelector));
  const minLeft = Math.min(...childBounds.map((bounds) => bounds.left));
  const maxRight = Math.max(...childBounds.map((bounds) => bounds.right));
  const spanWidth = Math.max(0, maxRight - minLeft);
  const twoPremiseExtra = childHosts.length === 2 ? 16 : 0;
  component.lineWidthPx = spanWidth + twoPremiseExtra;

  const spanCenterWithinChildren = minLeft + spanWidth / 2;
  const childrenRect = childrenContainer.getBoundingClientRect();
  const conclusionRect = conclusionEl.getBoundingClientRect();
  const scaleX = conclusionEl.offsetWidth > 0 ? (conclusionRect.width / conclusionEl.offsetWidth) : 1;
  const safeScaleX = scaleX > 0 ? scaleX : 1;
  const spanCenterViewport = childrenRect.left + (spanCenterWithinChildren * safeScaleX);
  const conclusionCenterViewport = conclusionRect.left + (conclusionRect.width / 2);
  component.lineOffsetPx = (spanCenterViewport - conclusionCenterViewport) / safeScaleX;
}

export function scheduleLineMeasure(
  component: LineMeasurementHost & { measureScheduled?: boolean },
  formulaSelector: string
): void {
  if (component.measureScheduled) return;
  component.measureScheduled = true;

  requestAnimationFrame(() => {
    component.measureScheduled = false;
    updateLineWidth(component, formulaSelector);
  });
}
