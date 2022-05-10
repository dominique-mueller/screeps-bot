import { ROOM_SIZE } from './constants';
import { ADJACENT_POSITIONS_OFFSETS } from './plan.constants';

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
export const findRoomExitPositions = (room: Room, adjacentRoomName: Room['name']): Array<RoomPosition> => {
  return (
    // Query for exit positions
    room.find(
      // Find exit position query
      room.findExitTo(adjacentRoomName) as ExitConstant, // Calculated, so we assume it exists
    )
  );
};

/**
 * Check if the given position is available (e.g. not a wall)
 *
 * @param   room     Room
 * @param   position Position
 * @returns          Flag, describing whether the position is available or not
 */
export const isPositionAvailable = (room: Room, position: RoomPosition): boolean => {
  return (
    room
      // Get room terrain
      .getTerrain()
      // Check room terrain for position
      .get(position.x, position.y) !== TERRAIN_MASK_WALL
  );
};

/**
 * Check if the given position is adjacent to an unavailable position (e.g. wall)
 *
 * @param   room     Room
 * @param   position Position
 * @returns          Flag, describing whether the given position is adjacent to an unavailable position
 */
export const isPositionAdjacentToUnavailablePosition = (room: Room, position: RoomPosition): boolean => {
  // Find adjacent positions
  let isPositionAdjacentToUnavailablePosition = false;
  for (
    let adjacentPositionOffsetIndex = 0;
    adjacentPositionOffsetIndex < ADJACENT_POSITIONS_OFFSETS.length;
    adjacentPositionOffsetIndex++
  ) {
    // Find adjacent position
    const adjacentPosition: RoomPosition | null = room.getPositionAt(
      position.x + ADJACENT_POSITIONS_OFFSETS[adjacentPositionOffsetIndex][0],
      position.y + ADJACENT_POSITIONS_OFFSETS[adjacentPositionOffsetIndex][1],
    );

    // Ignore position if it does not exist (e.g. outside room) or is not available (e.g. wall)
    if (adjacentPosition === null || !isPositionAvailable(room, adjacentPosition)) {
      isPositionAdjacentToUnavailablePosition = true;
      break; // Early exit
    }
  }

  // Done
  return isPositionAdjacentToUnavailablePosition;
};

/**
 * Filter positions
 *
 * @param   positions            List of positions
 * @param   positionsToFilterOut List of positions to filter out
 * @returns                      List of filtered positions
 */
export const filterPositions = (positions: Array<RoomPosition>, positionsToFilterOut: Array<RoomPosition>): Array<RoomPosition> => {
  // For each position
  const filteredPositions: Array<RoomPosition> = [];
  for (let positionIndex = 0; positionIndex < positions.length; positionIndex++) {
    // Check if the position also exists within the list of positions to be filtered out
    let shouldPositionBeFilteredOut: boolean = false;
    for (let positionToFilterOutIndex = 0; positionToFilterOutIndex < positionsToFilterOut.length; positionToFilterOutIndex++) {
      if (positions[positionIndex].isEqualTo(positionsToFilterOut[positionToFilterOutIndex])) {
        shouldPositionBeFilteredOut = true;
        break; // Early exit
      }
    }

    // Ignore position if should be fitlered out
    if (shouldPositionBeFilteredOut) {
      continue;
    }

    // Save position
    filteredPositions.push(positions[positionIndex]);
  }

  // Done
  return filteredPositions;
};

/**
 * Find adjacent positions for the given position
 *
 * @param   room     Room
 * @param   position Position
 * @returns          List of adjacent positions (no duplicates)
 */
export const findAdjacentPositionsForPosition = (room: Room, position: RoomPosition): Array<RoomPosition> => {
  // Find adjacent positionss
  const adjacentPositions: Array<RoomPosition> = [];
  for (
    let adjacentPositionOffsetIndex = 0;
    adjacentPositionOffsetIndex < ADJACENT_POSITIONS_OFFSETS.length;
    adjacentPositionOffsetIndex++
  ) {
    // Find adjacent position
    const adjacentPosition: RoomPosition | null = room.getPositionAt(
      position.x + ADJACENT_POSITIONS_OFFSETS[adjacentPositionOffsetIndex][0],
      position.y + ADJACENT_POSITIONS_OFFSETS[adjacentPositionOffsetIndex][1],
    );

    // Ignore position if it does not exist (e.g. outside room) or is not available (e.g. wall)
    if (adjacentPosition === null || !isPositionAvailable(room, adjacentPosition)) {
      continue;
    }

    // Save position
    adjacentPositions.push(adjacentPosition);
  }

  // Done
  return adjacentPositions;
};

/**
 * Find adjacent positions for the given positions
 *
 * @param   room      Room
 * @param   positions List of positions
 * @returns           List of adjacent positions (no duplicates)
 */
export const findAdjacentPositionsForPositions = (room: Room, positions: Array<RoomPosition>): Array<RoomPosition> => {
  // Find adjacent positions
  const adjacentPositions: Array<RoomPosition> = [];
  for (let positionIndex = 0; positionIndex < positions.length; positionIndex++) {
    // Save positions
    adjacentPositions.push(
      // Prevent duplicates
      ...filterPositions(
        // Find adjacent positions
        findAdjacentPositionsForPosition(room, positions[positionIndex]),
        [
          // Ignore given positions, ignore already found adjacent positions
          ...positions,
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
 * @param   room     Room
 * @param   position Position
 * @param   n        Number of times to find adjacent positions (ideally above 1)
 * @returns          List of positions (no duplicates) split into lists by n (ascending)
 */
export const findAdjacentPositionsForPositionNTimes = (room: Room, position: RoomPosition, n: number): Array<Array<RoomPosition>> => {
  // Find adjacent positions n times
  const adjacentPositions: Array<Array<RoomPosition>> = [];
  for (let nIndex = 0; nIndex < n; nIndex++) {
    // Save adjacent positions for range / wave n
    adjacentPositions[nIndex] =
      // Prevent duplicates
      filterPositions(
        // Find next adjacent positions based on the previous list of adjacent positions,
        // or based on the original position in the first iteration
        findAdjacentPositionsForPositions(room, adjacentPositions[nIndex - 1] || [position]),
        // Ignore previous-previous list of adjacent positions (previous list of adjacent positions already ignored by default),
        // or the original position in the first iteration
        adjacentPositions[nIndex - 2] || [position],
      );
  }

  // Done
  return adjacentPositions;
};

// TODO: Check for refactor ...

export const findDirectPathForPlanning = (room: Room, startPosition: RoomPosition, endPosition: RoomPosition): Array<RoomPosition> => {
  // Configuration
  const cost: number = 1; // Same cost for every position

  // Find path
  return (
    room
      .findPath(startPosition, endPosition, {
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
      .map((pathStep: PathStep): RoomPosition => {
        return room.getPositionAt(pathStep.x, pathStep.y) as RoomPosition; // Calculated, so must exist
      })
  );
};

/**
 * Find path for planning purposes (custom path finding configuration, custom cost matrix)
 *
 * @param   room               Room
 * @param   startPosition      Start position
 * @param   endPosition        End position
 * @param   preferredPositions Preferred positions (e.g. roads)
 * @param   blockedPositions   Blocked positions (e.g. next to sources)
 * @returns                    List of path postions (empty if not reachable)
 */
export const findPathForPlanning = (
  room: Room,
  startPosition: RoomPosition,
  endPosition: RoomPosition,
  preferredPositions: Array<RoomPosition>,
  blockedPositions: Array<RoomPosition>,
): Array<RoomPosition> => {
  // Configuration
  const roadCost: number = 1; // Minimum cost
  const terrainCost: number = roadCost * 2; // Twice as expensive
  const blockedCost: number = 255; // Maximum cost (aka unreachable)

  // Find path
  return (
    room
      .findPath(startPosition, endPosition, {
        costCallback: (_roomName: string, costMatrix: CostMatrix): CostMatrix => {
          preferredPositions.forEach((road: RoomPosition): void => {
            costMatrix.set(road.x, road.y, roadCost);
          });
          blockedPositions.forEach((blockedPosition: RoomPosition): void => {
            costMatrix.set(blockedPosition.x, blockedPosition.y, blockedCost);
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
      .map((pathStep: PathStep): RoomPosition => {
        return room.getPositionAt(pathStep.x, pathStep.y) as RoomPosition; // Calculated, so must exist
      })
  );
};

/**
 * Sort path positions by length
 *
 * @param   pathA Path positions A
 * @param   pathB Path positions B
 * @returns       Sorting result
 */
export const sortPathPositionsByLength = (pathA: Array<RoomPosition>, pathB: Array<RoomPosition>): number => {
  return pathA.length - pathB.length;
};

/**
 * Find shortest path within a list of given paths
 *
 * @param   paths Paths (lists of room positions)
 * @returns       Shortest path (list of room positions)
 */
export const findShortestPath = (paths: Array<Array<RoomPosition>>): Array<RoomPosition> => {
  return paths.sort(sortPathPositionsByLength)[0]; // Take the shortest path
};
