/** ~1 of 8 ticks explores never-run / oldest so yield winners do not starve new cities. */
export const EXPLORE_FLOOR_EVERY = 8;

export function isExploreFloorSlot(completedRunCount: number): boolean {
  return completedRunCount % EXPLORE_FLOOR_EVERY === 0;
}
