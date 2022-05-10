/**
 * Adjacent position offsets
 *
 * Notes:
 * - Room coordinate system starts with x=0, y=0 at top-left
 * - Calculating adjacent positions starts at the top middle, and continues clockwise until complete
 */
export const ADJACENT_POSITIONS_OFFSETS: Array<[number, number]> = [
  [0, -1], // top-center
  [1, -1], // top-right
  [1, 0], // center-right
  [1, 1], // bottom-right
  [0, 1], // bottom-center
  [-1, 1], // bottom-left
  [-1, 0], // center-left
  [-1, -1], // top-left
];
