/**
 * Room Controller
 */
export interface RoomController {
  dockingPosition: RoomPosition;
  id: StructureController['id'];
  linkPosition: RoomPosition;
  otherDockingPositions: Array<RoomPosition>;
  position: RoomPosition;
}

/**
 * Room Spawn
 */
export interface RoomSpawn {
  dockingPositions: Array<RoomPosition>;
  id: StructureSpawn['id'] | null;
  position: RoomPosition;
}

/**
 * Room Source
 */
export interface RoomSource {
  dockingPosition: RoomPosition;
  id: Source['id'];
  linkPosition: RoomPosition;
  otherDockingPositions: Array<RoomPosition>;
  position: RoomPosition;
}

/**
 * Room Mineral
 */
export interface RoomMineral {
  dockingPositions: Array<RoomPosition>;
  id: Mineral['id'];
  position: RoomPosition;
}

/**
 * Room Road
 */
export interface RoomRoad {
  position: RoomPosition;
  priority: number;
}

/**
 * Room Link
 */
export interface RoomLink {
  position: RoomPosition;
}

/**
 * Room Tower
 */
export interface RoomTower {
  position: RoomPosition;
}

/**
 * Room Storage
 */
export interface RoomStorage {
  position: RoomPosition;
}

/**
 * Room Wall
 */
export interface RoomWall {
  position: RoomPosition;
}

/**
 * Room Rampart
 */
export interface RoomRampart {
  position: RoomPosition;
  priority: number;
}

/**
 * Room Map
 */
export interface RoomMap {
  baseCenter: RoomPosition;
  controller: RoomController;
  links: Array<RoomLink>;
  minerals: Array<RoomMineral>;
  ramparts: Array<RoomRampart>;
  reserved: Array<RoomPosition>;
  roads: Array<RoomRoad>;
  sources: Array<RoomSource>;
  spawns: Array<RoomSpawn>;
  storages: Array<RoomStorage>;
  towers: Array<RoomTower>;
  walls: Array<RoomWall>;
}
