import { RoomMap, RoomMapMineral, RoomMapRampart, RoomMapRoad, RoomMapSource, RoomMapWall } from './plan';
import {
  filterPositions,
  findAdjacentRoomNames,
  findRoomExitPositions,
  findPathForPlanning,
  findShortestPath,
  findAdjacentPositionsForPosition,
} from './plan.utilities';
import { flattenArray } from './utilities';

/**
 * Plan exit road to the given adjacent room
 *
 * @param room             Room
 * @param roomMap          Room map
 * @param adjacentRoomName Adjacent room name
 */
const planExitRoad = (room: Room, roomMap: RoomMap, adjacentRoomName: Room['name']): void => {
  // Find positions
  const roomExitPositions: Array<RoomPosition> = findRoomExitPositions(room, adjacentRoomName);

  // Find road positions
  const roadPositions: Array<RoomPosition> = findShortestPath(
    roomExitPositions.map((roomExitPosition: RoomPosition): Array<RoomPosition> => {
      return findPathForPlanning(
        room,
        roomMap.baseCenter,
        roomExitPosition,
        roomMap.roads.map((road: RoomMapRoad): RoomPosition => {
          return road.position;
        }),
        [
          // Ignore positions blocked by controller
          roomMap.controller.dockingPosition,
          roomMap.controller.linkPosition,
          ...roomMap.controller.otherDockingPositions,

          // Ignore positions blocked by sources
          ...flattenArray(
            roomMap.sources.map((source: RoomMapSource): Array<RoomPosition> => {
              return [source.dockingPosition, source.linkPosition, ...source.otherDockingPositions];
            }),
          ),

          // Ignore postions blocked by minerals
          ...flattenArray(
            roomMap.minerals.map((mineral: RoomMapMineral): Array<RoomPosition> => {
              return mineral.dockingPositions;
            }),
          ),
        ],
      );
    }),
  ) // Ignore base structure positions, ignore room exit position
    .slice(1, -1);
  const newRoadPositions: Array<RoomPosition> = filterPositions(
    roadPositions,
    roomMap.roads.map((road: RoomMapRoad): RoomPosition => {
      return road.position;
    }),
  );

  // Open up the wall where the room exit road meets it, and replace it with a wider rampart
  const roadWallCrossingPosition: RoomPosition = newRoadPositions.find((newRoadPosition: RoomPosition): boolean => {
    return roomMap.walls.some((wall: RoomMapWall): boolean => {
      return newRoadPosition.isEqualTo(wall.position);
    });
  }) as RoomPosition;
  const roadWallCrossingAdjacentPositions: Array<RoomPosition> = findAdjacentPositionsForPosition(room, roadWallCrossingPosition);
  const updatedWallPositions: Array<RoomPosition> = filterPositions(
    roomMap.walls.map((wall: RoomMapWall): RoomPosition => {
      return wall.position;
    }),
    [roadWallCrossingPosition, ...roadWallCrossingAdjacentPositions],
  );
  const rampartPositions: Array<RoomPosition> = filterPositions(
    roomMap.walls.map((wall: RoomMapWall): RoomPosition => {
      return wall.position;
    }),
    updatedWallPositions,
  );

  // Update room map
  roomMap.roads.push(
    ...newRoadPositions.map((roadPosition: RoomPosition): RoomMapRoad => {
      return {
        position: roadPosition,
        priority: 4,
      };
    }),
  );
  roomMap.reserved = filterPositions(roomMap.reserved, newRoadPositions);
  roomMap.walls = updatedWallPositions.map((wallPosition: RoomPosition): RoomMapWall => {
    return {
      position: wallPosition,
    };
  });
  roomMap.ramparts.push(
    ...rampartPositions.map((rampartPosition): RoomMapRampart => {
      return {
        position: rampartPosition,
        priority: 1,
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
export const planExitRoads = (room: Room, roomMap: RoomMap): void => {
  // Find adjacent rooms
  const adjacentRoomNames: Array<Room['name']> = findAdjacentRoomNames(room);

  // Plan road to each room exit
  adjacentRoomNames.forEach((adjacentRoomName: Room['name']): void => {
    planExitRoad(room, roomMap, adjacentRoomName);
  });
};
