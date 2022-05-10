import { RoomMap, RoomMapWall } from './plan';
import { filterPositions, findAdjacentPositionsForPosition, findAdjacentRoomNames, findRoomExitPositions } from './plan.utilities';

/**
 * Plan exit to the given adjacent room
 *
 * @param room             Room
 * @param roomMap          Room map
 * @param adjacentRoomName Adjacent room name
 */
const planExit = (room: Room, roomMap: RoomMap, adjacentRoomName: Room['name']): void => {
  // Find positions
  const roomExitPositions: Array<RoomPosition> = findRoomExitPositions(room, adjacentRoomName);

  // Find blocked positions (adjacent positions to room exit positions)
  // Note: The outmost 2 positions - room exit positions and their adjacent positions - cannot be used for constructing walls
  const blockedPositions: Array<RoomPosition> = [];
  for (let roomExitPositionIndex = 0; roomExitPositionIndex < roomExitPositions.length; roomExitPositionIndex++) {
    // Save blocked positions
    blockedPositions.push(
      // De-duplicate positions
      ...filterPositions(
        // Find adjacent positions
        findAdjacentPositionsForPosition(room, roomExitPositions[roomExitPositionIndex]),
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
  const wallPositions: Array<RoomPosition> = [];
  for (let blockedPositionIndex = 0; blockedPositionIndex < blockedPositions.length; blockedPositionIndex++) {
    // Save wall positions
    wallPositions.push(
      // De-duplicate positions
      ...filterPositions(
        // Find adjacent positions
        findAdjacentPositionsForPosition(room, blockedPositions[blockedPositionIndex]),
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
  roomMap.walls.push(
    ...wallPositions.map((wallPosition: RoomPosition): RoomMapWall => {
      return {
        position: wallPosition,
      };
    }),
  );
};

/**
 * Plan exits
 *
 * @param room    Room
 * @param roomMap Room map
 */
export const planExits = (room: Room, roomMap: RoomMap): void => {
  // Find adjacent rooms
  const adjacentRoomNames: Array<Room['name']> = findAdjacentRoomNames(room);

  // Plan exit walls
  adjacentRoomNames.forEach((adjacentRoomName: Room['name']): void => {
    planExit(room, roomMap, adjacentRoomName);
  });
};
