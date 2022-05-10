import {
  RoomMap,
  RoomLink,
  RoomMineral,
  RoomRampart,
  RoomRoad,
  RoomSource,
  RoomSpawn,
  RoomStorage,
  RoomTower,
  RoomWall
} from "./plan.interfaces";

/**
 * Render room map visualization (DEBUG)
 *
 * @param room    Room
 * @param roomMap Room map
 */
export const renderRoomMapVisualization = (room: Room, roomMap: RoomMap): void => {
  // Render base
  room.visual.text('BASE', roomMap.baseCenter.x, roomMap.baseCenter.y, {
    align: 'center',
    color: 'blue',
    font: 0.2,
  });

  // Render spawn
  roomMap.spawns.forEach((spawn: RoomSpawn): void => {
    room.visual.text('SPAWN', spawn.position.x, spawn.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render tower
  roomMap.towers.forEach((tower: RoomTower): void => {
    room.visual.text('TOWER', tower.position.x, tower.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render storages
  roomMap.storages.forEach((storage: RoomStorage): void => {
    room.visual.text('STORAGE', storage.position.x, storage.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render links
  roomMap.links.forEach((link: RoomLink): void => {
    room.visual.text('LINK', link.position.x, link.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render controller
  room.visual.text('DOCK(S)', roomMap.controller.dockingPosition.x, roomMap.controller.dockingPosition.y, {
    align: 'center',
    color: 'yellow',
    font: 0.2,
  });
  roomMap.controller.otherDockingPositions.forEach((dockingPosition: RoomPosition): void => {
    room.visual.text('DOCK(D)', dockingPosition.x, dockingPosition.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render sources
  roomMap.sources.forEach((source: RoomSource): void => {
    room.visual.text('DOCK(S)', source.dockingPosition.x, source.dockingPosition.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
    source.otherDockingPositions.forEach((dockingPosition: RoomPosition): void => {
      room.visual.text('DOCK(D)', dockingPosition.x, dockingPosition.y, {
        align: 'center',
        color: 'yellow',
        font: 0.2,
      });
    });
  });

  // Render minerals
  roomMap.minerals.forEach((mineral: RoomMineral): void => {
    mineral.dockingPositions.forEach((dockingPosition: RoomPosition): void => {
      room.visual.text('DOCK', dockingPosition.x, dockingPosition.y, {
        align: 'center',
        color: 'yellow',
        font: 0.2,
      });
    });
  });

  // Render roads
  roomMap.roads.forEach((road: RoomRoad): void => {
    room.visual.text(`ROAD(${road.priority})`, road.position.x, road.position.y + 0.2, {
      align: 'center',
      color: 'lightblue',
      font: 0.2,
    });
  });

  // Render walls
  roomMap.walls.forEach((wall: RoomWall): void => {
    room.visual.text('WALL', wall.position.x, wall.position.y, {
      align: 'center',
      color: 'red',
      font: 0.2,
    });
  });

  // Render walls
  roomMap.ramparts.forEach((rampart: RoomRampart): void => {
    room.visual.text(`RAMP(${rampart.priority})`, rampart.position.x, rampart.position.y, {
      align: 'center',
      color: 'red',
      font: 0.2,
    });
  });

  // Render reserved
  roomMap.reserved.forEach((position: RoomPosition): void => {
    room.visual.text('AVAIL', position.x, position.y + 0.2, {
      align: 'center',
      color: 'grey',
      font: 0.2,
    });
  });
};
