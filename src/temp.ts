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

// Find base center position
// const adjacentSpawnPositionClosestToAnyAdjacentRoom: RoomPosition = getShortestPathToAnyRoomExit(room, initialSpawn.pos)[0];
// const baseCenterPosition: RoomPosition = room.getPositionAt(
//   initialSpawn.pos.x + (initialSpawn.pos.x - adjacentSpawnPositionClosestToAnyAdjacentRoom.x),
//   initialSpawn.pos.y + (initialSpawn.pos.y - adjacentSpawnPositionClosestToAnyAdjacentRoom.y),
// ) as RoomPosition;
