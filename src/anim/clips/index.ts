import type { ClipSet } from '../types.ts';

/**
 * Animations by art id. A drawing at art/<id>.svg gets its clips from the file
 * at the same place here, src/anim/clips/<id>.ts, which exports them as its
 * default. Units need all five clips; bases, turrets, projectiles and effects
 * only the ones they use.
 */
const FILES = import.meta.glob('./*/**/*.ts', { eager: true, import: 'default' }) as Record<string, Partial<ClipSet>>;

export const CLIPS: Record<string, Partial<ClipSet>> = {};
for (const [path, clips] of Object.entries(FILES)) {
  CLIPS[path.replace(/^\.\//, '').replace(/\.ts$/, '')] = clips;
}
