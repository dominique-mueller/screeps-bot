import { SB_Room, SB_RoomPosition } from './plan.interfaces';
import { filterPositions, findAdjacentRoomPositionsForRoomPosition, findAdjacentRoomNames, findRoomExitPositions } from './plan.utilities';

/**
 * Plan exit to the given adjacent room
 *
 * @param room             Room
 * @param roomMap          Room map
 * @param adjacentRoomName Adjacent room name
 */
const planExit = (room: Room, roomMap: SB_Room, adjacentRoomName: Room['name']): void => {
  // Find positions
  const roomExitPositions: Array<SB_RoomPosition> = findRoomExitPositions(room, adjacentRoomName);

  // Find blocked positions (adjacent positions to room exit positions)
  // Note: The outmost 2 positions - room exit positions and their adjacent positions - cannot be used for constructing walls
  const blockedPositions: Array<SB_RoomPosition> = [];
  for (let roomExitPositionIndex = 0; roomExitPositionIndex < roomExitPositions.length; roomExitPositionIndex++) {
    // Save blocked positions
    blockedPositions.push(
      // De-duplicate positions
      ...filterPositions(
        // Find adjacent positions
        findAdjacentRoomPositionsForRoomPosition(room, roomExitPositions[roomExitPositionIndex]),
        [
          // Ignore room exit positions
          ...roomExitPositions,
          // Ignore already found blocked positions
          ...blockedPositions,
        ],
      ),
    );
  }

  // Find wall positions
  // Note: Wall entries will be planned in other steps later on
  const wallPositions: Array<SB_RoomPosition> = [];
  for (let blockedPositionIndex = 0; blockedPositionIndex < blockedPositions.length; blockedPositionIndex++) {
    // Save wall positions
    wallPositions.push(
      // De-duplicate positions
      ...filterPositions(
        // Find adjacent positions
        findAdjacentRoomPositionsForRoomPosition(room, blockedPositions[blockedPositionIndex]),
        [
          // Ignore room exit positions
          ...roomExitPositions,
          // Ignore blocked positions
          ...blockedPositions,
          // Ignore already found wall positions
          ...wallPositions,
        ],
      ),
    );
  }

  // Update room map
  roomMap.walls.push(...wallPositions);
};

/**
 * Plan exits
 *
 * @param room    Room
 * @param roomMap Room map
 */
export const planExits = (room: Room, roomMap: SB_Room): void => {
  // Find adjacent rooms
  const adjacentRoomNames: Array<Room['name']> = findAdjacentRoomNames(room);

  // Plan exit walls
  adjacentRoomNames.forEach((adjacentRoomName: Room['name']): void => {
    planExit(room, roomMap, adjacentRoomName);
  });
};
