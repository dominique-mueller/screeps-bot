import { SB_Room, SB_Mineral, SB_Rampart, SB_Road, SB_Source, SB_Wall, SB_RoomPosition } from './plan.interfaces';
import {
  filterPositions,
  findAdjacentRoomNames,
  findRoomExitPositions,
  findPathForPlanning,
  findShortestPath,
  findAdjacentRoomPositionsForRoomPosition,
} from './plan.utilities';
import { flattenArray } from './utilities';

/**
 * Plan exit road to the given adjacent room
 *
 * @param room             Room
 * @param roomMap          Room map
 * @param adjacentRoomName Adjacent room name
 */
const planExitRoad = (room: Room, roomMap: SB_Room, adjacentRoomName: Room['name']): void => {
  // Find positions
  const roomExitPositions: Array<SB_RoomPosition> = findRoomExitPositions(room, adjacentRoomName);

  // Find road positions
  const roadPositions: Array<SB_RoomPosition> = findShortestPath(
    roomExitPositions.map((roomExitPosition: SB_RoomPosition): Array<SB_RoomPosition> => {
      return findPathForPlanning(room, roomMap.base, roomExitPosition, roomMap.roads, [
        // Ignore positions blocked by controller
        roomMap.controller.dockingPosition,
        roomMap.controller.linkPosition,
        ...roomMap.controller.otherDockingPositions,

        // Ignore positions blocked by sources
        ...flattenArray(
          roomMap.sources.map((source: SB_Source): Array<SB_RoomPosition> => {
            return [source.dockingPosition, source.linkPosition, ...source.otherDockingPositions];
          }),
        ),

        // Ignore postions blocked by minerals
        ...flattenArray(
          roomMap.minerals.map((mineral: SB_Mineral): Array<SB_RoomPosition> => {
            return mineral.dockingPositions;
          }),
        ),
      ]);
    }),
  ) // Ignore base structure positions, ignore room exit position
    .slice(1, -1);
  const newRoadPositions: Array<SB_RoomPosition> = filterPositions(roadPositions, roomMap.roads);

  // Open up the wall where the room exit road meets it, and replace it with a wider rampart
  const roadWallCrossingPosition: SB_RoomPosition = newRoadPositions.find((newRoadPosition: SB_RoomPosition): boolean => {
    return roomMap.walls.some((wall: SB_Wall): boolean => {
      return newRoadPosition.position.isEqualTo(wall.position);
    });
  }) as SB_RoomPosition;
  const roadWallCrossingAdjacentPositions: Array<SB_RoomPosition> = findAdjacentRoomPositionsForRoomPosition(
    room,
    roadWallCrossingPosition,
  );
  const updatedWallPositions: Array<SB_RoomPosition> = filterPositions(roomMap.walls, [
    roadWallCrossingPosition,
    ...roadWallCrossingAdjacentPositions,
  ]);
  const rampartPositions: Array<SB_RoomPosition> = filterPositions(roomMap.walls, updatedWallPositions);

  // Update room map
  roomMap.roads.push(
    ...newRoadPositions.map((roadPosition: SB_RoomPosition): SB_Road => {
      return {
        ...roadPosition,
        buildPriority: 4,
      };
    }),
  );
  roomMap.reserved = filterPositions(roomMap.reserved, newRoadPositions);
  roomMap.walls = updatedWallPositions;
  roomMap.ramparts.push(
    ...rampartPositions.map((rampartPosition): SB_Rampart => {
      return {
        ...rampartPosition,
        buildPriority: 1,
      };
    }),
  );
};

/**
 * Plan exit roads
 *
 * @param room    Room
 * @param roomMap Room map (will be mutated in place)
 */
export const planExitRoads = (room: Room, roomMap: SB_Room): void => {
  // Find adjacent rooms
  const adjacentRoomNames: Array<Room['name']> = findAdjacentRoomNames(room);

  // Plan road to each room exit
  adjacentRoomNames.forEach((adjacentRoomName: Room['name']): void => {
    planExitRoad(room, roomMap, adjacentRoomName);
  });
};
