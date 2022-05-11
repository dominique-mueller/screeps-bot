import {
  SB_Room,
  SB_Link,
  SB_Mineral,
  SB_Rampart,
  SB_Road,
  SB_Source,
  SB_Spawn,
  SB_Storage,
  SB_Tower,
  SB_Wall,
  SB_RoomPosition,
} from './plan.interfaces';

/**
 * Render room map visualization (DEBUG)
 *
 * @param room    Room
 * @param roomMap Room map
 */
export const renderRoomMapVisualization = (room: Room, roomMap: SB_Room): void => {
  // Render base
  room.visual.text('BASE', roomMap.base.position.x, roomMap.base.position.y, {
    align: 'center',
    color: 'blue',
    font: 0.2,
  });

  // Render spawn
  roomMap.spawns.forEach((spawn: SB_Spawn): void => {
    room.visual.text('SPAWN', spawn.position.x, spawn.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render tower
  roomMap.towers.forEach((tower: SB_Tower): void => {
    room.visual.text('TOWER', tower.position.x, tower.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render storages
  roomMap.storages.forEach((storage: SB_Storage): void => {
    room.visual.text('STORAGE', storage.position.x, storage.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render links
  roomMap.links.forEach((link: SB_Link): void => {
    room.visual.text('LINK', link.position.x, link.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render controller
  room.visual.text('DOCK(S)', roomMap.controller.dockingPosition.position.x, roomMap.controller.dockingPosition.position.y, {
    align: 'center',
    color: 'yellow',
    font: 0.2,
  });
  roomMap.controller.otherDockingPositions.forEach((dockingPosition: SB_RoomPosition): void => {
    room.visual.text('DOCK(D)', dockingPosition.position.x, dockingPosition.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
  });

  // Render sources
  roomMap.sources.forEach((source: SB_Source): void => {
    room.visual.text('DOCK(S)', source.dockingPosition.position.x, source.dockingPosition.position.y, {
      align: 'center',
      color: 'yellow',
      font: 0.2,
    });
    source.otherDockingPositions.forEach((dockingPosition: SB_RoomPosition): void => {
      room.visual.text('DOCK(D)', dockingPosition.position.x, dockingPosition.position.y, {
        align: 'center',
        color: 'yellow',
        font: 0.2,
      });
    });
  });

  // Render minerals
  roomMap.minerals.forEach((mineral: SB_Mineral): void => {
    mineral.dockingPositions.forEach((dockingPosition: SB_RoomPosition): void => {
      room.visual.text('DOCK', dockingPosition.position.x, dockingPosition.position.y, {
        align: 'center',
        color: 'yellow',
        font: 0.2,
      });
    });
  });

  // Render roads
  roomMap.roads.forEach((road: SB_Road): void => {
    room.visual.text(`ROAD(${road.buildPriority})`, road.position.x, road.position.y + 0.2, {
      align: 'center',
      color: 'lightblue',
      font: 0.2,
    });
  });

  // Render walls
  roomMap.walls.forEach((wall: SB_Wall): void => {
    room.visual.text('WALL', wall.position.x, wall.position.y, {
      align: 'center',
      color: 'red',
      font: 0.2,
    });
  });

  // Render walls
  roomMap.ramparts.forEach((rampart: SB_Rampart): void => {
    room.visual.text(`RAMP(${rampart.buildPriority})`, rampart.position.x, rampart.position.y, {
      align: 'center',
      color: 'red',
      font: 0.2,
    });
  });

  // Render reserved
  roomMap.reserved.forEach((position: SB_RoomPosition): void => {
    room.visual.text('AVAIL', position.position.x, position.position.y + 0.2, {
      align: 'center',
      color: 'grey',
      font: 0.2,
    });
  });
};
