import { SB_Room, SB_Mineral, SB_Road, SB_Source, SB_Wall, SB_RoomPosition } from './plan.interfaces';
import { filterPositions, findPathForPlanning } from './plan.utilities';
import { flattenArray } from './utilities';

/**
 * Plan roads between spawn and source
 *
 * @param room    Room
 * @param roomMap Room map (will be mutated in place)
 * @param source  Source
 */
export const planRoadsBetweenSpawnAndSource = (room: Room, roomMap: SB_Room, source: SB_Source): void => {
  // Find road positions
  const roadPositions: Array<SB_RoomPosition> = findPathForPlanning(room, roomMap.base, source.dockingPosition, roomMap.roads, [
    // Ignore walls
    ...roomMap.walls,

    // Ignore positions blocked by controller
    roomMap.controller.dockingPosition,
    roomMap.controller.linkPosition,
    ...roomMap.controller.otherDockingPositions,

    // Ignore positions blocked by sources
    ...filterPositions(
      flattenArray(
        roomMap.sources.map((source: SB_Source): Array<SB_RoomPosition> => {
          return [source.dockingPosition, source.linkPosition, ...source.otherDockingPositions];
        }),
      ),
      // But allow currently used source docking position
      [source.dockingPosition],
    ),

    // Ignore postions blocked by minerals
    ...flattenArray(
      roomMap.minerals.map((mineral: SB_Mineral): Array<SB_RoomPosition> => {
        return mineral.dockingPositions;
      }),
    ),
  ])
    // Ignore base structure positions, ignore source docking position
    .slice(1, -1);
  const newRoadPositions: Array<SB_RoomPosition> = filterPositions(roadPositions, roomMap.roads);

  // Update room map
  roomMap.roads.push(
    ...newRoadPositions.map((roadPosition: SB_RoomPosition): SB_Road => {
      return {
        ...roadPosition,
        buildPriority: 1,
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
export const planRoadsBetweenControllerAndSource = (room: Room, roomMap: SB_Room, source: SB_Source): void => {
  // Find road positions
  const roadPositions: Array<SB_RoomPosition> = findPathForPlanning(
    room,
    roomMap.controller.dockingPosition,
    source.dockingPosition,
    roomMap.roads,
    [
      // Ignore walls
      ...roomMap.walls,

      // Ignore positions blocked by controller (except docking position itself)
      roomMap.controller.linkPosition,
      ...roomMap.controller.otherDockingPositions,

      // Ignore positions blocked by sources
      ...filterPositions(
        flattenArray(
          roomMap.sources.map((source: SB_Source): Array<SB_RoomPosition> => {
            return [source.dockingPosition, source.linkPosition, ...source.otherDockingPositions];
          }),
        ),
        // But allow currently used source docking position
        [source.dockingPosition],
      ),

      // Ignore postions blocked by minerals
      ...flattenArray(
        roomMap.minerals.map((mineral: SB_Mineral): Array<SB_RoomPosition> => {
          return mineral.dockingPositions;
        }),
      ),
    ],
  )
    // Ignore source docking position
    .slice(0, -1);
  const newRoadPositions: Array<SB_RoomPosition> = filterPositions(roadPositions, roomMap.roads);

  // Update room map
  roomMap.roads.push(
    ...newRoadPositions.map((roadPosition: SB_RoomPosition): SB_Road => {
      return {
        ...roadPosition,
        buildPriority: 2,
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
export const planRoads = (room: Room, roomMap: SB_Room): void => {
  // Plan roads between base and sources
  roomMap.sources.forEach((source: SB_Source): void => {
    planRoadsBetweenSpawnAndSource(room, roomMap, source);
  });

  // Plan roads between controller and sources
  roomMap.sources.forEach((source: SB_Source): void => {
    planRoadsBetweenControllerAndSource(room, roomMap, source);
  });
};
