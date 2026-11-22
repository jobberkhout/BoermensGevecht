/**
 * Everything one faction says and is called. Each faction has a file like this
 * next to this one; what all factions share is in ui/nl.ts.
 */
export interface FactionText {
  name: string;
  /** Where it is from, shown under the name on the title card. */
  place: string;
  /** What it calls its money. */
  money: string;
  win: { head: string; sub: string };
  /** What its super unit says when an enemy special passes it by. */
  unmoved: string;
  /** Display names by definition id ('hm.2025.light'). */
  names: Record<string, string>;
  /** One line under the name on the how-to-play card. */
  blurbs: Record<string, string>;
  /** What a beaten unit mutters while it slinks off, by the era it comes from. */
  slinkOff: Record<string, readonly string[]>;
  /** What a fresh unit shouts as it walks out, by era. */
  battleCry: Record<string, readonly string[]>;
}
