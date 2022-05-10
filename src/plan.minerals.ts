import { RoomMap } from './plan';
import { findAdjacentPositionsForPositionNTimes } from './plan.utilities';

/**
 * Plan mineral
 *
 * @param   room    Room
 * @param   roomMap Room map (will be mutated in place)
 * @param   mineral Source
 */
const planSource = (room: Room, roomMap: RoomMap, mineral: Mineral): void => {
  // Get adjacent positions of mineral
  const adjacentPositions: Array<Array<RoomPosition>> = findAdjacentPositionsForPositionNTimes(room, mineral.pos, 2);

  // Find positions
  const dockingPositions: Array<RoomPosition> = adjacentPositions[0];
  const reserved: Array<RoomPosition> = adjacentPositions[1];

  // Update room map
  roomMap.minerals.push({
    dockingPositions,
    id: mineral.id,
    position: mineral.pos,
  });
  roomMap.reserved.push(...reserved);
};

/**
 * Plan minerals
 *
 * @param   room    Room
 * @param   roomMap Room map (will be mutated in place)
 */
export const planMinerals = (room: Room, roomMap: RoomMap): void => {
  // Find minerals
  const minerals: Array<Mineral> = room.find(FIND_MINERALS);

  // Plan each source
  minerals.forEach((mineral: Mineral): void => {
    planSource(room, roomMap, mineral);
  });
};
