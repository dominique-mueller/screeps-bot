import { RoomMap, RoomMapLink, RoomMapRoad, RoomMapSpawn, RoomMapStorage, RoomMapTower } from './plan';
import { filterPositions, findAdjacentPositionsForPosition, findAdjacentPositionsForPositions } from './plan.utilities';

// export const getShortestPathToAnyRoomExit = (room: Room, position: RoomPosition): Array<RoomPosition> => {
//   // Find adjacent rooms
//   const adjacentRoomNames: Array<Room['name']> = findAdjacentRoomNames(room);

//   // Find positions
//   const roomExitPositions: Array<RoomPosition> = flattenArray(
//     adjacentRoomNames.map((adjacentRoomName: Room['name']): Array<RoomPosition> => {
//       return findRoomExitPositions(room, adjacentRoomName);
//     }),
//   );

//   // Find shortest path between room exits and spawn
//   const shortestPathPositions: Array<RoomPosition> = findShortestPath(
//     roomExitPositions.map((roomExitPosition: RoomPosition): Array<RoomPosition> => {
//       return findPathForPlanning(room, position, roomExitPosition, [], []);
//     }),
//   );

//   // Done
//   return shortestPathPositions;
// };

/**
 * Plan spawn
 *
 * TODO:
 * - Handle creating new spawn (e.g. capturing additional room)
 *
 * @param   room    Room
 * @param   roomMap Room map (will be mutated in place)
 */
export const planSpawn = (room: Room, roomMap: RoomMap): void => {
  // Find spawn
  const initialSpawn: StructureSpawn = room.find(FIND_MY_SPAWNS)[0];

  // Find base center position
  const baseCenterPosition: RoomPosition = room.getPositionAt(initialSpawn.pos.x, initialSpawn.pos.y - 1) as RoomPosition;

  // Find base center position
  // const adjacentSpawnPositionClosestToAnyAdjacentRoom: RoomPosition = getShortestPathToAnyRoomExit(room, initialSpawn.pos)[0];
  // const baseCenterPosition: RoomPosition = room.getPositionAt(
  //   initialSpawn.pos.x + (initialSpawn.pos.x - adjacentSpawnPositionClosestToAnyAdjacentRoom.x),
  //   initialSpawn.pos.y + (initialSpawn.pos.y - adjacentSpawnPositionClosestToAnyAdjacentRoom.y),
  // ) as RoomPosition;

  // Assign structures to positions
  //
  // Notes:
  // - Spawns are as spread out as possible
  // - On tower per side
  // - Other structures in between
  const baseCenterAdjacentPositions: Array<RoomPosition> = findAdjacentPositionsForPosition(room, baseCenterPosition);
  const spawnPositions: Array<RoomPosition> = [baseCenterAdjacentPositions[1], baseCenterAdjacentPositions[7]];
  const linkPositions: Array<RoomPosition> = [baseCenterAdjacentPositions[3]];
  const towerPositions: Array<RoomPosition> = [baseCenterAdjacentPositions[2], baseCenterAdjacentPositions[6]];
  const storagePositions: Array<RoomPosition> = [baseCenterAdjacentPositions[5]];
  const reserved: Array<RoomPosition> = [baseCenterAdjacentPositions[0]];
  const roadPositions: Array<RoomPosition> = filterPositions(findAdjacentPositionsForPositions(room, baseCenterAdjacentPositions), [
    baseCenterPosition,
  ]);

  // Update room map
  roomMap.baseCenter = baseCenterPosition;
  roomMap.reserved.push(...reserved);
  roomMap.spawns.push(
    {
      dockingPositions: [],
      id: initialSpawn.id,
      position: initialSpawn.pos,
    },
    ...spawnPositions.map((spawnPosition: RoomPosition): RoomMapSpawn => {
      return {
        dockingPositions: [],
        id: null,
        position: spawnPosition,
      };
    }),
  );
  roomMap.links.push(
    ...linkPositions.map((linkPosition: RoomPosition): RoomMapLink => {
      return {
        position: linkPosition,
      };
    }),
  );
  roomMap.towers.push(
    ...towerPositions.map((towerPosition: RoomPosition): RoomMapTower => {
      return {
        position: towerPosition,
      };
    }),
  );
  roomMap.storages.push(
    ...storagePositions.map((storagePosition: RoomPosition): RoomMapStorage => {
      return {
        position: storagePosition,
      };
    }),
  );
  roomMap.roads.push(
    ...roadPositions.map((adjacentPosition: RoomPosition): RoomMapRoad => {
      return {
        position: adjacentPosition,
        priority: 0,
      };
    }),
  );
};
