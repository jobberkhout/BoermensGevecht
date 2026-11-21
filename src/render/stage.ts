import { WORLD_H, WORLD_W } from '../defs/balance.ts';

/**
 * The canvas the battle is drawn on. The world is always 1920x1080 logical
 * units; `k` says how many real pixels one unit is on this screen.
 */
export interface Stage {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** Backing-store pixels per logical unit. */
  k: number;
  /** Called after every size change, and once right away. */
  onResize(listener: (stage: Stage) => void): void;
}

/** Widest backing store we allocate, however dense the display. */
const MAX_WIDTH = 3840;

export function createStage(canvas: HTMLCanvasElement): Stage {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available in this browser');
  const listeners: ((stage: Stage) => void)[] = [];
  const stage: Stage = {
    canvas,
    ctx,
    k: 1,
    onResize(listener) {
      listeners.push(listener);
      listener(stage);
    },
  };

  const fit = (): void => {
    const cssWidth = canvas.clientWidth || WORLD_W;
    const width = Math.max(320, Math.min(MAX_WIDTH, Math.round(cssWidth * (window.devicePixelRatio || 1))));
    const height = Math.round((width * WORLD_H) / WORLD_W);
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    stage.k = width / WORLD_W;
    for (const l of listeners) l(stage);
  };

  fit();
  new ResizeObserver(fit).observe(canvas);
  window.addEventListener('resize', fit);
  return stage;
}

/** Points the context at world coordinates. */
export function useWorld(stage: Stage): void {
  stage.ctx.setTransform(stage.k, 0, 0, stage.k, 0, 0);
}
