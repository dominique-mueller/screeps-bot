import { RoomMap } from './plan';
import {
  filterPositions,
  findAdjacentPositionsForPosition,
  findAdjacentPositionsForPositionNTimes,
  findDirectPathForPlanning,
  sortPathPositionsByLength,
} from './plan.utilities';

/**
 * Plan controller
 *
 * @param room    Room
 * @param roomMap Room map (will be mutated in place)
 */
export const planController = (room: Room, roomMap: RoomMap): void => {
  // Find controller
  const controller: StructureController = room.controller as StructureController;

  // Find controller adjacent positions
  const controllerAdjacentPositions: Array<Array<RoomPosition>> = findAdjacentPositionsForPositionNTimes(room, controller.pos, 2);

  // Find optimal link position
  const linkPosition: RoomPosition =
    // Start with the transport positions
    controllerAdjacentPositions[1]
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
  const secondaryDockingPositions: Array<RoomPosition> = filterPositions(controllerAdjacentPositions[0], linkAdjacentPositions);
  const primaryDockingPositions: Array<RoomPosition> = filterPositions(controllerAdjacentPositions[0], secondaryDockingPositions);
  const dockingPosition: RoomPosition = primaryDockingPositions[0];
  const otherDockingPositions: Array<RoomPosition> = [...primaryDockingPositions.slice(1), ...secondaryDockingPositions];

  // Find reserved positions
  const reserved: Array<RoomPosition> = [
    // Transport positions (except link position)
    ...filterPositions(controllerAdjacentPositions[1], [linkPosition]),
    // Link adjacent positions (except docking positions)
    ...filterPositions(linkAdjacentPositions, primaryDockingPositions),
  ];

  // Update room map
  roomMap.controller = {
    dockingPosition,
    id: controller.id,
    linkPosition,
    otherDockingPositions,
    position: controller.pos,
  };
  roomMap.links.push({
    position: linkPosition,
  });
  roomMap.reserved.push(...reserved);
};
