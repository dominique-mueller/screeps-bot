import { SB_Room, SB_RoomPosition } from './plan.interfaces';
import {
  filterPositions,
  findAdjacentRoomPositionsForRoomPosition,
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
const planSource = (room: Room, roomMap: SB_Room, source: Source): void => {
  // Get source adjacent positions
  // - Range 1 for docking (e.g. static harvesting via link, dynamic harvesting via transporter) - always blocked (no constructions)!
  // - Range 2 for transport (e.g. static via link, dynamic via transporter) - reserved (open for road constructions)!
  const sourceAdjacentPositions: Array<Array<SB_RoomPosition>> = findAdjacentPositionsForPositionNTimes(room, { position: source.pos }, 2);

  // Find optimal link position
  const linkPosition: SB_RoomPosition =
    // Start with the transport positions
    sourceAdjacentPositions[1]
      // Find direct paths between transport positions and base link
      .map((adjacentPosition: SB_RoomPosition): Array<SB_RoomPosition> => {
        return findDirectPathForPlanning(room, roomMap.links[0], adjacentPosition);
      })
      // Find shortest path
      .sort(sortPathPositionsByLength)[0]
      // Find link position
      .slice(-1)[0];

  // Find adjacent link positions
  const linkAdjacentPositions: Array<SB_RoomPosition> = findAdjacentRoomPositionsForRoomPosition(room, linkPosition);

  // Find docking positions
  const secondaryDockingPositions: Array<SB_RoomPosition> = filterPositions(sourceAdjacentPositions[0], linkAdjacentPositions);
  const primaryDockingPositions: Array<SB_RoomPosition> = filterPositions(sourceAdjacentPositions[0], secondaryDockingPositions);
  const dockingPosition: SB_RoomPosition = primaryDockingPositions[0];
  const otherDockingPositions: Array<SB_RoomPosition> = [...primaryDockingPositions.slice(1), ...secondaryDockingPositions];

  // Find reserved positions
  const reserved: Array<SB_RoomPosition> = [
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
  roomMap.links.push(linkPosition);
  roomMap.reserved.push(...reserved);
};

/**
 * Plan sources
 *
 * @param   room    Room
 * @param   roomMap Room map (will be mutated in place)
 */
export const planSources = (room: Room, roomMap: SB_Room): void => {
  // Find sources
  const sources: Array<Source> = room.find(FIND_SOURCES);

  // Plan each source
  sources.forEach((source: Source): void => {
    planSource(room, roomMap, source);
  });
};
