import { SB_Room, SB_Road, SB_Spawn, SB_RoomPosition } from './plan.interfaces';
import { filterPositions, findAdjacentRoomPositionsForRoomPosition, findAdjacentRoomPositionsForRoomPositions } from './plan.utilities';

/**
 * Plan base
 *
 * TODO:
 * - Place link close to other links
 *
 * TODO: Long term
 * - Handle creating new spawn (e.g. capturing additional room)
 *
 * @param   room    Room
 * @param   roomMap Room map (will be mutated in place)
 */
export const planBase = (room: Room, roomMap: SB_Room): void => {
  // Find spawn
  const initialSpawn: StructureSpawn = room.find(FIND_MY_SPAWNS)[0];

  // Find base center position
  const baseCenterPosition: SB_RoomPosition = { position: room.getPositionAt(initialSpawn.pos.x, initialSpawn.pos.y - 1) as RoomPosition };

  // Assign structures to positions
  //
  // Notes:
  // - Spawns are as spread out as possible
  // - On tower per side
  // - Other structures in between
  const baseCenterAdjacentPositions: Array<SB_RoomPosition> = findAdjacentRoomPositionsForRoomPosition(room, baseCenterPosition);
  const spawnPositions: Array<SB_RoomPosition> = [baseCenterAdjacentPositions[1], baseCenterAdjacentPositions[7]];
  const linkPositions: Array<SB_RoomPosition> = [baseCenterAdjacentPositions[3]];
  const towerPositions: Array<SB_RoomPosition> = [baseCenterAdjacentPositions[2], baseCenterAdjacentPositions[6]];
  const storagePositions: Array<SB_RoomPosition> = [baseCenterAdjacentPositions[5]];
  const reserved: Array<SB_RoomPosition> = [baseCenterAdjacentPositions[0]];
  const roadPositions: Array<SB_RoomPosition> = filterPositions(
    findAdjacentRoomPositionsForRoomPositions(room, baseCenterAdjacentPositions),
    [baseCenterPosition],
  );

  // Update room map
  roomMap.base = baseCenterPosition;
  roomMap.reserved.push(...reserved);
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
  roomMap.links.push(...linkPositions);
  roomMap.towers.push(...towerPositions);
  roomMap.storages.push(...storagePositions);
  roomMap.roads.push(
    ...roadPositions.map((adjacentPosition: SB_RoomPosition): SB_Road => {
      return {
        ...adjacentPosition,
        buildPriority: 0,
      };
    }),
  );
};
