import { SB_Room, SB_Road, SB_Spawn, SB_RoomPosition } from './plan.interfaces';
import {
  filterPositions,
  findAdjacentRoomPositionsForRoomPosition,
  findAdjacentRoomPositionsForRoomPositions,
  findDirectPathForPlanning,
  sortPathPositionsByLength,
} from './plan.utilities';
import { flattenArray } from './utilities';

/**
 * Plan base
 *
 * TODO:
 * - Place link close to other links
 *
 * TODO: Long term
 * - Handle creating new base without existing spawn (e.g. capturing additional room)
 *
 * @param   room    Room
 * @param   roomMap Room map (will be mutated in place)
 */
export const planBase = (room: Room, roomMap: SB_Room): void => {
  // Find spawn
  const initialSpawn: StructureSpawn = room.find(FIND_MY_SPAWNS)[0];

  // Find base position and its adjacent positions
  const basePosition: SB_RoomPosition = { position: room.getPositionAt(initialSpawn.pos.x, initialSpawn.pos.y - 1) as RoomPosition };
  const baseAdjacentPositions: Array<SB_RoomPosition> = findAdjacentRoomPositionsForRoomPosition(room, basePosition);

  // Find spawn and tower positions (equally spread based on existing spawn)
  const spawnPositions: Array<SB_RoomPosition> = [baseAdjacentPositions[1], baseAdjacentPositions[7]];
  const towerPositions: Array<SB_RoomPosition> = [baseAdjacentPositions[2], baseAdjacentPositions[6]];

  // Find link, storage and reserved position (based on shortest distance to all sources)
  const sources: Array<Source> = room.find(FIND_SOURCES);
  const unusedBaseAdjacentPositions: Array<SB_RoomPosition> = [
    baseAdjacentPositions[0],
    baseAdjacentPositions[3],
    baseAdjacentPositions[5],
  ];
  const sortedAvailableBaseAdjacentPositions: Array<Array<SB_RoomPosition>> = unusedBaseAdjacentPositions
    .map((baseAdjacentPosition: SB_RoomPosition): Array<SB_RoomPosition> => {
      // Combine all paths between sources and base adjacent position
      return flattenArray(
        sources.map((source: Source): Array<SB_RoomPosition> => {
          // Find path between source and base adjacent position
          return findDirectPathForPlanning(room, { position: source.pos }, baseAdjacentPosition);
        }),
      );
    })
    // Find shortest path by sorting by sum of paths between source and base adjacent position
    .sort(sortPathPositionsByLength);
  const linkPosition: SB_RoomPosition = sortedAvailableBaseAdjacentPositions[0].slice(-1)[0];
  const storagePosition: SB_RoomPosition = sortedAvailableBaseAdjacentPositions[1].slice(-1)[0];
  const reservedPosition: SB_RoomPosition = sortedAvailableBaseAdjacentPositions[2].slice(-1)[0];

  // Find road positions
  const roadPositions: Array<SB_RoomPosition> = filterPositions(findAdjacentRoomPositionsForRoomPositions(room, baseAdjacentPositions), [
    basePosition,
  ]);

  // Update room map
  roomMap.base = basePosition;
  roomMap.reserved.push(reservedPosition);
  roomMap.spawns.push(
    {
      id: initialSpawn.id,
      position: initialSpawn.pos,
    },
    ...spawnPositions.map((spawnPosition: SB_RoomPosition): SB_Spawn => {
      return {
        ...spawnPosition,
        id: null,
      };
    }),
  );
  roomMap.links.push(linkPosition);
  roomMap.towers.push(...towerPositions);
  roomMap.storages.push(storagePosition);
  roomMap.roads.push(
    ...roadPositions.map((adjacentPosition: SB_RoomPosition): SB_Road => {
      return {
        ...adjacentPosition,
        buildPriority: 0,
      };
    }),
  );
};
