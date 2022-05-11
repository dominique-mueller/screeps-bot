import { ROOM_SIZE } from './constants';
import { ADJACENT_POSITIONS_OFFSETS } from './plan.constants';
import { SB_RoomPosition } from './plan.interfaces';

/**
 * Find adjacent room names based on the given room
 *
 * Note:
 * We cannot actually get "Room" instances via "Game.rooms[roomName]" instead of just the room names because those are only available for
 * rooms we control
 * See <https://docs.screeps.com/api/#Game.rooms>
 *
 * @param   room Room
 * @returns      List of room names
 */
export const findAdjacentRoomNames = (room: Room): Array<Room['name']> => {
  return (
    // Find room names
    Object.values(
      // Find info about room exits
      Game.map.describeExits(room.name),
    )
  );
};

/**
 * Find exit positions from the given room to the given adjacent room
 *
 * @param   room             Room
 * @param   adjacentRoomName Adjacent room name (room must exist!)
 * @returns                  List of room exit positions
 */
export const findRoomExitPositions = (room: Room, adjacentRoomName: Room['name']): Array<SB_RoomPosition> => {
  return (
    room
      // Query for exit positions
      .find(
        // Find exit position query
        room.findExitTo(adjacentRoomName) as ExitConstant, // Calculated, so we assume it exists
      )

      // Map to room position
      .map((roomExitPosition: RoomPosition): SB_RoomPosition => {
        return {
          position: roomExitPosition,
        };
      })
  );
};

/**
 * Check if the given room position is available (e.g. not a wall)
 *
 * @param   room         Room
 * @param   roomPosition Room position
 * @returns              Flag, describing whether the position is available or not
 */
export const isPositionAvailable = (room: Room, roomPosition: SB_RoomPosition): boolean => {
  return (
    room
      // Get room terrain
      .getTerrain()
      // Check room terrain for position
      .get(roomPosition.position.x, roomPosition.position.y) !== TERRAIN_MASK_WALL
  );
};

/**
 * Check if the given room position is adjacent to an unavailable position (e.g. wall)
 *
 * @param   room         Room
 * @param   roomPosition Room position
 * @returns              Flag, describing whether the given position is adjacent to an unavailable position
 */
export const isPositionAdjacentToUnavailablePosition = (room: Room, roomPosition: SB_RoomPosition): boolean => {
  // Find adjacent positions
  let isPositionAdjacentToUnavailablePosition = false;
  for (
    let adjacentPositionOffsetIndex = 0;
    adjacentPositionOffsetIndex < ADJACENT_POSITIONS_OFFSETS.length;
    adjacentPositionOffsetIndex++
  ) {
    // Find adjacent position
    const adjacentPosition: RoomPosition | null = room.getPositionAt(
      roomPosition.position.x + ADJACENT_POSITIONS_OFFSETS[adjacentPositionOffsetIndex][0],
      roomPosition.position.y + ADJACENT_POSITIONS_OFFSETS[adjacentPositionOffsetIndex][1],
    );

    // Ignore position if it does not exist (e.g. outside room) or is not available (e.g. wall)
    if (adjacentPosition === null || !isPositionAvailable(room, { position: adjacentPosition })) {
      isPositionAdjacentToUnavailablePosition = true;
      break; // Early exit
    }
  }

  // Done
  return isPositionAdjacentToUnavailablePosition;
};

/**
 * Filter room positions
 *
 * @param   roomPositions            List of room positions
 * @param   roomPositionsToFilterOut List of room positions to filter out
 * @returns                          List of filtered room positions
 */
export const filterPositions = (
  roomPositions: Array<SB_RoomPosition>,
  roomPositionsToFilterOut: Array<SB_RoomPosition>,
): Array<SB_RoomPosition> => {
  // For each position
  const filteredPositions: Array<SB_RoomPosition> = [];
  for (let positionIndex = 0; positionIndex < roomPositions.length; positionIndex++) {
    // Check if the position also exists within the list of positions to be filtered out
    let shouldPositionBeFilteredOut: boolean = false;
    for (let positionToFilterOutIndex = 0; positionToFilterOutIndex < roomPositionsToFilterOut.length; positionToFilterOutIndex++) {
      if (roomPositions[positionIndex].position.isEqualTo(roomPositionsToFilterOut[positionToFilterOutIndex].position)) {
        shouldPositionBeFilteredOut = true;
        break; // Early exit
      }
    }

    // Ignore position if should be fitlered out
    if (shouldPositionBeFilteredOut) {
      continue;
    }

    // Save position
    filteredPositions.push(roomPositions[positionIndex]);
  }

  // Done
  return filteredPositions;
};

/**
 * Find adjacent positions for the given position
 *
 * @param   room         Room
 * @param   roomPosition Room position
 * @returns              List of adjacent room positions (no duplicates)
 */
export const findAdjacentRoomPositionsForRoomPosition = (room: Room, roomPosition: SB_RoomPosition): Array<SB_RoomPosition> => {
  // Find adjacent positionss
  const adjacentPositions: Array<SB_RoomPosition> = [];
  for (
    let adjacentPositionOffsetIndex = 0;
    adjacentPositionOffsetIndex < ADJACENT_POSITIONS_OFFSETS.length;
    adjacentPositionOffsetIndex++
  ) {
    // Find adjacent position
    const adjacentPosition: RoomPosition | null = room.getPositionAt(
      roomPosition.position.x + ADJACENT_POSITIONS_OFFSETS[adjacentPositionOffsetIndex][0],
      roomPosition.position.y + ADJACENT_POSITIONS_OFFSETS[adjacentPositionOffsetIndex][1],
    );

    // Ignore position if it does not exist (e.g. outside room) or is not available (e.g. wall)
    if (adjacentPosition === null || !isPositionAvailable(room, { position: adjacentPosition })) {
      continue;
    }

    // Save position
    adjacentPositions.push({ position: adjacentPosition });
  }

  // Done
  return adjacentPositions;
};

/**
 * Find adjacent room positions for the given room positions
 *
 * @param   room          Room
 * @param   roomPositions List of room positions
 * @returns               List of room adjacent positions (no duplicates)
 */
export const findAdjacentRoomPositionsForRoomPositions = (room: Room, roomPositions: Array<SB_RoomPosition>): Array<SB_RoomPosition> => {
  // Find adjacent positions
  const adjacentPositions: Array<SB_RoomPosition> = [];
  for (let positionIndex = 0; positionIndex < roomPositions.length; positionIndex++) {
    // Save positions
    adjacentPositions.push(
      // Prevent duplicates
      ...filterPositions(
        // Find adjacent positions
        findAdjacentRoomPositionsForRoomPosition(room, roomPositions[positionIndex]),
        [
          // Ignore given positions, ignore already found adjacent positions
          ...roomPositions,
          // Ignore already found adjacent positions
          ...adjacentPositions,
        ],
      ),
    );
  }

  // Done
  return adjacentPositions;
};

/**
 * Find available adjacent positions for position in range
 *
 * Note:
 * Only use when n > 1, else use "findAdjacentPositionsForPositions" directly
 *
 * @param   room         Room
 * @param   roomPosition Room position
 * @param   n            Number of times to find adjacent room positions (ideally above 1)
 * @returns              List of room positions (no duplicates) split into lists by n (ascending)
 */
export const findAdjacentPositionsForPositionNTimes = (
  room: Room,
  roomPosition: SB_RoomPosition,
  n: number,
): Array<Array<SB_RoomPosition>> => {
  // Find adjacent positions n times
  const adjacentPositions: Array<Array<SB_RoomPosition>> = [];
  for (let nIndex = 0; nIndex < n; nIndex++) {
    // Save adjacent positions for range / wave n
    adjacentPositions[nIndex] =
      // Prevent duplicates
      filterPositions(
        // Find next adjacent positions based on the previous list of adjacent positions,
        // or based on the original position in the first iteration
        findAdjacentRoomPositionsForRoomPositions(room, adjacentPositions[nIndex - 1] || [roomPosition]),
        // Ignore previous-previous list of adjacent positions (previous list of adjacent positions already ignored by default),
        // or the original position in the first iteration
        adjacentPositions[nIndex - 2] || [roomPosition],
      );
  }

  // Done
  return adjacentPositions;
};

// TODO: Check for refactor ...

export const findDirectPathForPlanning = (
  room: Room,
  startRoomPosition: SB_RoomPosition,
  endRoomPosition: SB_RoomPosition,
): Array<SB_RoomPosition> => {
  // Configuration
  const cost: number = 1; // Same cost for every position

  // Find path
  return (
    room
      .findPath(startRoomPosition.position, endRoomPosition.position, {
        costCallback: (_roomName: string, costMatrix: CostMatrix): CostMatrix => {
          for (let x = 0; x < ROOM_SIZE; x++) {
            for (let y = 0; y < ROOM_SIZE; y++) {
              costMatrix.set(x, y, cost);
            }
          }
          return costMatrix;
        },
        ignoreCreeps: true,
        ignoreRoads: true, // Not built yet, we use "roads" parameter instead
        maxRooms: 1,
        plainCost: cost,
        swampCost: cost,
      })
      // TODO: Move into separate fn?
      .map((pathStep: PathStep): SB_RoomPosition => {
        return { position: room.getPositionAt(pathStep.x, pathStep.y) as RoomPosition }; // Calculated, so must exist
      })
  );
};

/**
 * Find path for planning purposes (custom path finding configuration, custom cost matrix)
 *
 * @param   room                   Room
 * @param   startRoomPosition      Start room position
 * @param   endRoomPosition        End room position
 * @param   preferredRoomPositions Preferred room positions (e.g. roads)
 * @param   blockedRoomPositions   Blocked room positions (e.g. next to sources)
 * @returns                        List of path room postions (empty if not reachable)
 */
export const findPathForPlanning = (
  room: Room,
  startRoomPosition: SB_RoomPosition,
  endRoomPosition: SB_RoomPosition,
  preferredRoomPositions: Array<SB_RoomPosition>,
  blockedRoomPositions: Array<SB_RoomPosition>,
): Array<SB_RoomPosition> => {
  // Configuration
  const roadCost: number = 1; // Minimum cost
  const terrainCost: number = roadCost * 2; // Twice as expensive
  const blockedCost: number = 255; // Maximum cost (aka unreachable)

  // Find path
  return (
    room
      .findPath(startRoomPosition.position, endRoomPosition.position, {
        costCallback: (_roomName: string, costMatrix: CostMatrix): CostMatrix => {
          preferredRoomPositions.forEach((preferredRoomPosition: SB_RoomPosition): void => {
            costMatrix.set(preferredRoomPosition.position.x, preferredRoomPosition.position.y, roadCost);
          });
          blockedRoomPositions.forEach((blockedRoomPosition: SB_RoomPosition): void => {
            costMatrix.set(blockedRoomPosition.position.x, blockedRoomPosition.position.y, blockedCost);
          });
          return costMatrix;
        },
        ignoreCreeps: true,
        ignoreRoads: true, // Not built yet, we use "roads" parameter instead
        maxRooms: 1,
        plainCost: terrainCost, // Ignore terrain, but allow planned roads to be twice as fast
        swampCost: terrainCost, // Ignore terrain, but allow planned roads to be twice as fast
      })
      // TODO: Move into separate fn?
      .map((pathStep: PathStep): SB_RoomPosition => {
        return { position: room.getPositionAt(pathStep.x, pathStep.y) as RoomPosition }; // Calculated, so must exist
      })
  );
};

/**
 * Sort path positions by length
 *
 * @param   pathA Path room positions A
 * @param   pathB Path room positions B
 * @returns       Sorting result
 */
export const sortPathPositionsByLength = (pathA: Array<SB_RoomPosition>, pathB: Array<SB_RoomPosition>): number => {
  return pathA.length - pathB.length;
};

/**
 * Find shortest path within a list of given paths
 *
 * @param   paths Paths (lists of room positions)
 * @returns       Shortest path (list of room positions)
 */
export const findShortestPath = (paths: Array<Array<SB_RoomPosition>>): Array<SB_RoomPosition> => {
  return (
    // Sort by path length
    paths.sort(sortPathPositionsByLength)[0] // Take the shortest path
  );
};
