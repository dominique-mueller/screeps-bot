import { RoomMap } from './plan';
import {
  filterPositions,
  findAdjacentPositionsForPosition,
  findAdjacentPositionsForPositionNTimes,
  findDirectPathForPlanning,
  sortPathPositionsByLength,
} from './plan.utilities';

/**
 * Plan source
 *
 * @param   room    Room
 * @param   roomMap Room map (will be mutated in place)
 * @param   source  Source
 */
const planSource = (room: Room, roomMap: RoomMap, source: Source): void => {
  // Get source adjacent positions
  // - Range 1 for docking (e.g. static harvesting via link, dynamic harvesting via transporter) - always blocked (no constructions)!
  // - Range 2 for transport (e.g. static via link, dynamic via transporter) - reserved (open for road constructions)!
  const sourceAdjacentPositions: Array<Array<RoomPosition>> = findAdjacentPositionsForPositionNTimes(room, source.pos, 2);

  // Find optimal link position
  const linkPosition: RoomPosition =
    // Start with the transport positions
    sourceAdjacentPositions[1]
      // Find direct paths between transport positions and base link
      .map((adjacentPosition: RoomPosition): Array<RoomPosition> => {
        return findDirectPathForPlanning(room, roomMap.links[0].position, adjacentPosition);
      })
      // Find shortest path
      .sort(sortPathPositionsByLength)[0]
      // Find link position
      .slice(-1)[0];

  // Find adjacent link positions
  const linkAdjacentPositions: Array<RoomPosition> = findAdjacentPositionsForPosition(room, linkPosition);

  // Find docking positions
  const secondaryDockingPositions: Array<RoomPosition> = filterPositions(sourceAdjacentPositions[0], linkAdjacentPositions);
  const primaryDockingPositions: Array<RoomPosition> = filterPositions(sourceAdjacentPositions[0], secondaryDockingPositions);
  const dockingPosition: RoomPosition = primaryDockingPositions[0];
  const otherDockingPositions: Array<RoomPosition> = [...primaryDockingPositions.slice(1), ...secondaryDockingPositions];

  // Find reserved positions
  const reserved: Array<RoomPosition> = [
    // Transport positions (except link position)
    ...filterPositions(sourceAdjacentPositions[1], [linkPosition]),
    // Link adjacent positions (except docking positions)
    ...filterPositions(linkAdjacentPositions, primaryDockingPositions),
  ];

  // Update room map
  roomMap.sources.push({
    dockingPosition,
    id: source.id,
    linkPosition,
    otherDockingPositions,
    position: source.pos,
  });
  roomMap.links.push({
    position: linkPosition,
  });
  roomMap.reserved.push(...reserved);
};

/**
 * Plan sources
 *
 * @param   room    Room
 * @param   roomMap Room map (will be mutated in place)
 */
export const planSources = (room: Room, roomMap: RoomMap): void => {
  // Find sources
  const sources: Array<Source> = room.find(FIND_SOURCES);

  // Plan each source
  sources.forEach((source: Source): void => {
    planSource(room, roomMap, source);
  });
};
