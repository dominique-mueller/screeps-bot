import { RoomMap, RoomMapMineral, RoomMapRoad, RoomMapSource, RoomMapWall } from './plan';
import { filterPositions, findPathForPlanning } from './plan.utilities';
import { flattenArray } from './utilities';

/**
 * Plan roads between spawn and source
 *
 * @param room    Room
 * @param roomMap Room map (will be mutated in place)
 * @param source  Source
 */
export const planRoadsBetweenSpawnAndSource = (room: Room, roomMap: RoomMap, source: RoomMapSource): void => {
  // Find road positions
  const roadPositions: Array<RoomPosition> = findPathForPlanning(
    room,
    roomMap.baseCenter,
    source.dockingPosition,
    roomMap.roads.map((road: RoomMapRoad): RoomPosition => {
      return road.position;
    }),
    [
      // Ignore walls
      ...roomMap.walls.map((wall: RoomMapWall): RoomPosition => {
        return wall.position;
      }),

      // Ignore positions blocked by controller
      roomMap.controller.dockingPosition,
      roomMap.controller.linkPosition,
      ...roomMap.controller.otherDockingPositions,

      // Ignore positions blocked by sources
      ...filterPositions(
        flattenArray(
          roomMap.sources.map((source: RoomMapSource): Array<RoomPosition> => {
            return [source.dockingPosition, source.linkPosition, ...source.otherDockingPositions];
          }),
        ),
        // But allow currently used source docking position
        [source.dockingPosition],
      ),

      // Ignore postions blocked by minerals
      ...flattenArray(
        roomMap.minerals.map((mineral: RoomMapMineral): Array<RoomPosition> => {
          return mineral.dockingPositions;
        }),
      ),
    ],
  )
    // Ignore base structure positions, ignore source docking position
    .slice(1, -1);
  const newRoadPositions: Array<RoomPosition> = filterPositions(
    roadPositions,
    roomMap.roads.map((road: RoomMapRoad): RoomPosition => {
      return road.position;
    }),
  );

  // Update room map
  roomMap.roads.push(
    ...newRoadPositions.map((roadPosition: RoomPosition): RoomMapRoad => {
      return {
        position: roadPosition,
        priority: 1,
      };
    }),
  );
  roomMap.reserved = filterPositions(roomMap.reserved, newRoadPositions);
};

/**
 * Plan roads between controller and source
 *
 * @param room    Room
 * @param roomMap Room map (will be mutated in place)
 * @param source  Source
 */
export const planRoadsBetweenControllerAndSource = (room: Room, roomMap: RoomMap, source: RoomMapSource): void => {
  // Find road positions
  const roadPositions: Array<RoomPosition> = findPathForPlanning(
    room,
    roomMap.controller.dockingPosition,
    source.dockingPosition,
    roomMap.roads.map((road: RoomMapRoad): RoomPosition => {
      return road.position;
    }),
    [
      // Ignore walls
      ...roomMap.walls.map((wall: RoomMapWall): RoomPosition => {
        return wall.position;
      }),

      // Ignore positions blocked by controller (except docking position itself)
      roomMap.controller.linkPosition,
      ...roomMap.controller.otherDockingPositions,

      // Ignore positions blocked by sources
      ...filterPositions(
        flattenArray(
          roomMap.sources.map((source: RoomMapSource): Array<RoomPosition> => {
            return [source.dockingPosition, source.linkPosition, ...source.otherDockingPositions];
          }),
        ),
        // But allow currently used source docking position
        [source.dockingPosition],
      ),

      // Ignore postions blocked by minerals
      ...flattenArray(
        roomMap.minerals.map((mineral: RoomMapMineral): Array<RoomPosition> => {
          return mineral.dockingPositions;
        }),
      ),
    ],
  )
    // Ignore source docking position
    .slice(0, -1);
  const newRoadPositions: Array<RoomPosition> = filterPositions(
    roadPositions,
    roomMap.roads.map((road: RoomMapRoad): RoomPosition => {
      return road.position;
    }),
  );

  // Update room map
  roomMap.roads.push(
    ...newRoadPositions.map((roadPosition: RoomPosition): RoomMapRoad => {
      return {
        position: roadPosition,
        priority: 2,
      };
    }),
  );
  roomMap.reserved = filterPositions(roomMap.reserved, newRoadPositions);
};

/**
 * Plan roads
 *
 * @param room    Room
 * @param roomMap Room map (will be mutated in place)
 */
export const planRoads = (room: Room, roomMap: RoomMap): void => {
  // Plan roads between base and sources
  roomMap.sources.forEach((source: RoomMapSource): void => {
    planRoadsBetweenSpawnAndSource(room, roomMap, source);
  });

  // Plan roads between controller and sources
  roomMap.sources.forEach((source: RoomMapSource): void => {
    planRoadsBetweenControllerAndSource(room, roomMap, source);
  });
};
