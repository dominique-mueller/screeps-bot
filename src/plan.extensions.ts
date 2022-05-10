import { CONTROLLER_MAX_LEVEL, ROOM_SIZE } from './constants';
import { RoomMap, RoomMineral, RoomRampart, RoomRoad, RoomSource, RoomWall } from './plan.interfaces';
import {
  filterPositions,
  findAdjacentPositionsForPositionNTimes,
  findAdjacentPositionsForPositions,
  isPositionAdjacentToUnavailablePosition,
} from './plan.utilities';
import { flattenArray } from './utilities';

/**
 * Check if the given position should be a road based on the spawn position and the building pattern ("plus-pattern" for optimal balance
 * between density and reachability)
 *
 * @param   position      Position
 * @param   spawnPosition Spawn position
 * @returns               Flag, describing whether the position should be a road or a structure
 */
const shouldBeRoadBasedOnBuildingPattern = (position: RoomPosition, spawnPosition: RoomPosition): boolean => {
  const verticalDistance: number = Math.abs(position.x - spawnPosition.x);
  const horizontalDistance: number = Math.abs(position.y - spawnPosition.y);
  const isPositionOnGrid =
    (verticalDistance % 2 === 0 && horizontalDistance % 2 === 0) || (verticalDistance % 2 === 1 && horizontalDistance % 2 === 1);
  const isPositionCenterOfPlus =
    ((verticalDistance + 2) % 4 === 0 && horizontalDistance % 4 === 0) ||
    (verticalDistance % 4 === 0 && (horizontalDistance + 2) % 4 === 0);
  return isPositionOnGrid && !isPositionCenterOfPlus;
};

const isPositionReachableViaAllowedPositions = (
  room: Room,
  startPosition: RoomPosition,
  endPosition: RoomPosition,
  allowedPositions: Array<RoomPosition>,
): boolean => {
  return (
    room.findPath(startPosition, endPosition, {
      costCallback: (_roomName: string, costMatrix: CostMatrix): CostMatrix => {
        for (let x = 0; x < ROOM_SIZE; x++) {
          for (let y = 0; y < ROOM_SIZE; y++) {
            costMatrix.set(x, y, 255); // MAX
          }
        }
        allowedPositions.forEach((allowedPosition: RoomPosition) => {
          costMatrix.set(allowedPosition.x, allowedPosition.y, 1);
        });
        return costMatrix;
      },
      ignoreCreeps: true,
      ignoreRoads: true, // Not built yet, we use "roads" parameter instead
      maxRooms: 1,
      plainCost: 1, // Reset
      swampCost: 1, // Reset
    }).length > 0
  );
};

/**
 * Plane extensions
 *
 * @param room    Room
 * @param roomMap Room map (will be mutated in place)
 */
export const planExtensions = (room: Room, roomMap: RoomMap): void => {
  const desiredNumberOfStructures: number = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][CONTROLLER_MAX_LEVEL];

  // TODO: Better way of determining base setup size??
  const basePositions: Array<Array<RoomPosition>> = findAdjacentPositionsForPositionNTimes(room, roomMap.baseCenter, 2);

  // Find road and structure positions
  const extensionPositionsPerRange: Array<Array<RoomPosition>> = [];
  const roadPositionsPerRange: Array<Array<RoomPosition>> = [];
  let rangeIndex = 0;
  while (flattenArray(extensionPositionsPerRange).length < desiredNumberOfStructures) {
    // Prepare for results
    roadPositionsPerRange[rangeIndex] = [];
    extensionPositionsPerRange[rangeIndex] = [];

    // Find next adjacent positions
    const adjacentPositions: Array<RoomPosition> = filterPositions(
      findAdjacentPositionsForPositions(
        room,
        rangeIndex === 0 ? basePositions[1] : [...extensionPositionsPerRange[rangeIndex - 1], ...roadPositionsPerRange[rangeIndex - 1]],
      ),
      [
        // Ignore already processed positions
        ...flattenArray(extensionPositionsPerRange),
        ...flattenArray(roadPositionsPerRange),

        // Ignore base
        ...(rangeIndex === 0 ? flattenArray(basePositions) : basePositions[1]),

        // Ignore walls
        ...roomMap.walls.map((wall: RoomWall): RoomPosition => {
          return wall.position;
        }),

        // Ignore ramparts
        ...roomMap.ramparts.map((rampart: RoomRampart): RoomPosition => {
          return rampart.position;
        }),

        // Ignore controller
        roomMap.controller.dockingPosition,
        roomMap.controller.linkPosition,
        ...roomMap.controller.otherDockingPositions,

        // Ignore sources
        ...flattenArray(
          roomMap.sources.map((source: RoomSource): Array<RoomPosition> => {
            return [source.dockingPosition, source.linkPosition, ...source.otherDockingPositions];
          }),
        ),

        // Ignore minerals
        ...flattenArray(
          roomMap.minerals.map((mineral: RoomMineral): Array<RoomPosition> => {
            return mineral.dockingPositions;
          }),
        ),

        // Ignore roads
        ...roomMap.roads.map((road: RoomRoad): RoomPosition => {
          return road.position;
        }),

        // Ignore reserved
        ...roomMap.reserved,
      ],
    );

    // Save results
    for (let adjacentPositionsIndex = 0; adjacentPositionsIndex < adjacentPositions.length; adjacentPositionsIndex++) {
      // Stop if we have already collected enough positions
      if (flattenArray(extensionPositionsPerRange).length === desiredNumberOfStructures) {
        break; // Early exit
      }

      // Save as road OR extension
      // ... based on pattern
      const shouldBeRoad: boolean = shouldBeRoadBasedOnBuildingPattern(adjacentPositions[adjacentPositionsIndex], roomMap.baseCenter);
      // ... while avoiding roads that touch unavailable places (e.g. walls) to maximize road efficiency
      const isAdjacentToUnavailablePosition: boolean = isPositionAdjacentToUnavailablePosition(
        room,
        adjacentPositions[adjacentPositionsIndex],
      );

      if (shouldBeRoad && !isAdjacentToUnavailablePosition) {
        roadPositionsPerRange[rangeIndex].push(adjacentPositions[adjacentPositionsIndex]);
      } else {
        // Check whether the position is actually reachable (and not blocked by other extension, walls etc.)
        const isReachableViaRoadPositions = isPositionReachableViaAllowedPositions(
          room,
          adjacentPositions[adjacentPositionsIndex],
          roomMap.baseCenter,
          [
            roomMap.baseCenter,
            ...flattenArray(basePositions),
            ...flattenArray(roadPositionsPerRange),
            ...roomMap.roads.map((road: RoomRoad): RoomPosition => {
              return road.position;
            }),
          ],
        );

        // Only save position as extension position if reachable
        if (isReachableViaRoadPositions) {
          extensionPositionsPerRange[rangeIndex].push(adjacentPositions[adjacentPositionsIndex]);
        }
      }
    }

    // Continue
    rangeIndex++;

    // EMERGENY EXIT
    if (rangeIndex === ROOM_SIZE) {
      console.log('[ERROR] Extension planning could not be finished!');
      break;
    }
  }

  // DEBUG
  // TODO: Put into roomMap as result
  flattenArray(extensionPositionsPerRange).forEach((position: RoomPosition): void => {
    room.visual.text('EXT', position.x, position.y, {
      align: 'center',
      color: 'darkorange',
      font: 0.2,
    });
  });
  flattenArray(roadPositionsPerRange).forEach((position: RoomPosition): void => {
    room.visual.text('ROAD(3)', position.x, position.y + 0.2, {
      align: 'center',
      color: 'lightblue',
      font: 0.2,
    });
  });
};
