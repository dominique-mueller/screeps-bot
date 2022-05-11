import { SB_Room, SB_RoomPosition } from './plan.interfaces';
import {
  filterPositions,
  findAdjacentRoomPositionsForRoomPosition,
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
export const planController = (room: Room, roomMap: SB_Room): void => {
  // Find controller
  const controller: StructureController = room.controller as StructureController;

  // Find controller adjacent positions
  const controllerAdjacentPositions: Array<Array<SB_RoomPosition>> = findAdjacentPositionsForPositionNTimes(
    room,
    { position: controller.pos },
    2,
  );

  // Find optimal link position
  const linkPosition: SB_RoomPosition =
    // Start with the transport positions
    controllerAdjacentPositions[1]
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
  const secondaryDockingPositions: Array<SB_RoomPosition> = filterPositions(controllerAdjacentPositions[0], linkAdjacentPositions);
  const primaryDockingPositions: Array<SB_RoomPosition> = filterPositions(controllerAdjacentPositions[0], secondaryDockingPositions);
  const dockingPosition: SB_RoomPosition = primaryDockingPositions[0];
  const otherDockingPositions: Array<SB_RoomPosition> = [...primaryDockingPositions.slice(1), ...secondaryDockingPositions];

  // Find reserved positions
  const reserved: Array<SB_RoomPosition> = [
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
  roomMap.links.push(linkPosition);
  roomMap.reserved.push(...reserved);
};
