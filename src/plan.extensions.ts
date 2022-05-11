import { CONTROLLER_MAX_LEVEL, ROOM_SIZE } from './constants';
import { SB_Room, SB_Mineral, SB_Rampart, SB_Road, SB_Source, SB_Wall, SB_RoomPosition } from './plan.interfaces';
import {
  filterPositions,
  findAdjacentPositionsForPositionNTimes,
  findAdjacentRoomPositionsForRoomPositions,
  isPositionAdjacentToUnavailablePosition,
} from './plan.utilities';
import { flattenArray } from './utilities';

/**
 * Check if the given position should be a road based on the spawn position and the building pattern ("plus-pattern" for optimal balance
 * between density and reachability)
 *
 * @param   roomPosition      Room position
 * @param   baseRoomPosition Spawn room position
 * @returns                   Flag, describing whether the position should be a road or a structure
 */
const shouldBeRoadBasedOnBuildingPattern = (roomPosition: SB_RoomPosition, baseRoomPosition: SB_RoomPosition): boolean => {
  const verticalDistance: number = Math.abs(roomPosition.position.x - baseRoomPosition.position.x);
  const horizontalDistance: number = Math.abs(roomPosition.position.y - baseRoomPosition.position.y);
  const isPositionOnGrid =
    (verticalDistance % 2 === 0 && horizontalDistance % 2 === 0) || (verticalDistance % 2 === 1 && horizontalDistance % 2 === 1);
  const isPositionCenterOfPlus =
    ((verticalDistance + 2) % 4 === 0 && horizontalDistance % 4 === 0) ||
    (verticalDistance % 4 === 0 && (horizontalDistance + 2) % 4 === 0);
  return isPositionOnGrid && !isPositionCenterOfPlus;
};

const isPositionReachableViaAllowedPositions = (
  room: Room,
  startRoomPosition: SB_RoomPosition,
  endRoomPosition: SB_RoomPosition,
  allowedRoomPositions: Array<SB_RoomPosition>,
): boolean => {
  return (
    room.findPath(startRoomPosition.position, endRoomPosition.position, {
      costCallback: (_roomName: string, costMatrix: CostMatrix): CostMatrix => {
        for (let x = 0; x < ROOM_SIZE; x++) {
          for (let y = 0; y < ROOM_SIZE; y++) {
            costMatrix.set(x, y, 255); // MAX
          }
        }
        allowedRoomPositions.forEach((allowedPosition: SB_RoomPosition): void => {
          costMatrix.set(allowedPosition.position.x, allowedPosition.position.y, 1);
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
export const planExtensions = (room: Room, roomMap: SB_Room): void => {
  const desiredNumberOfStructures: number = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][CONTROLLER_MAX_LEVEL];

  // TODO: Better way of determining base setup size??
  const basePositions: Array<Array<SB_RoomPosition>> = findAdjacentPositionsForPositionNTimes(room, roomMap.base, 2);

  // Find road and structure positions
  const extensionPositionsPerRange: Array<Array<SB_RoomPosition>> = [];
  const roadPositionsPerRange: Array<Array<SB_RoomPosition>> = [];
  let rangeIndex = 0;
  while (flattenArray(extensionPositionsPerRange).length < desiredNumberOfStructures) {
    // Prepare for results
    roadPositionsPerRange[rangeIndex] = [];
    extensionPositionsPerRange[rangeIndex] = [];

    // Find next adjacent positions
    const adjacentPositions: Array<SB_RoomPosition> = filterPositions(
      findAdjacentRoomPositionsForRoomPositions(
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
        ...roomMap.walls,

        // Ignore ramparts
        ...roomMap.ramparts,

        // Ignore controller
        roomMap.controller.dockingPosition,
        roomMap.controller.linkPosition,
        ...roomMap.controller.otherDockingPositions,

        // Ignore sources
        ...flattenArray(
          roomMap.sources.map((source: SB_Source): Array<SB_RoomPosition> => {
            return [source.dockingPosition, source.linkPosition, ...source.otherDockingPositions];
          }),
        ),

        // Ignore minerals
        ...flattenArray(
          roomMap.minerals.map((mineral: SB_Mineral): Array<SB_RoomPosition> => {
            return mineral.dockingPositions;
          }),
        ),

        // Ignore roads
        ...roomMap.roads,

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
      const shouldBeRoad: boolean = shouldBeRoadBasedOnBuildingPattern(adjacentPositions[adjacentPositionsIndex], roomMap.base);
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
          roomMap.base,
          [
            roomMap.base,
            ...flattenArray(basePositions),
            ...flattenArray(roadPositionsPerRange),
            ...roomMap.roads,
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
  flattenArray(extensionPositionsPerRange).forEach((position: SB_RoomPosition): void => {
    room.visual.text('EXT', position.position.x, position.position.y, {
      align: 'center',
      color: 'darkorange',
      font: 0.2,
    });
  });
  flattenArray(roadPositionsPerRange).forEach((position: SB_RoomPosition): void => {
    room.visual.text('ROAD(3)', position.position.x, position.position.y + 0.2, {
      align: 'center',
      color: 'lightblue',
      font: 0.2,
    });
  });
};
