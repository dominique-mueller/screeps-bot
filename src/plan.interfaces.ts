/**
 * Id
 */
export interface SB_Id<T extends _HasId = any> {
  id: Id<T> | null;
}

/**
 * Room Position
 */
export interface SB_RoomPosition {
  position: RoomPosition;
}

/**
 * Build Priority
 */
export interface SB_BuildPriority {
  buildPriority: number;
}

/**
 * Controller
 */
export interface SB_Controller extends SB_Id<StructureController>, SB_RoomPosition {
  dockingPosition: SB_RoomPosition;
  linkPosition: SB_RoomPosition;
  otherDockingPositions: Array<SB_RoomPosition>;
}

/**
 * Spawn
 */
export interface SB_Spawn extends SB_Id<StructureSpawn>, SB_RoomPosition {}

/**
 * Source
 */
export interface SB_Source extends SB_Id<Source>, SB_RoomPosition {
  dockingPosition: SB_RoomPosition;
  linkPosition: SB_RoomPosition;
  otherDockingPositions: Array<SB_RoomPosition>;
}

/**
 * Mineral
 */
export interface SB_Mineral extends SB_Id<Mineral>, SB_RoomPosition {
  dockingPositions: Array<SB_RoomPosition>;
}

/**
 * Road
 */
export interface SB_Road extends SB_RoomPosition, SB_BuildPriority {}

/**
 * Link
 */
export interface SB_Link extends SB_RoomPosition {}

/**
 * Tower
 */
export interface SB_Tower extends SB_RoomPosition {}

/**
 * Storage
 */
export interface SB_Storage extends SB_RoomPosition {}

/**
 * Wall
 */
export interface SB_Wall extends SB_RoomPosition {}

/**
 * Rampart
 */
export interface SB_Rampart extends SB_RoomPosition, SB_BuildPriority {}

/**
 * Base
 */
export interface SB_Base extends SB_RoomPosition {}

/**
 * Room
 */
export interface SB_Room {
  base: SB_Base;
  controller: SB_Controller;
  links: Array<SB_Link>;
  minerals: Array<SB_Mineral>;
  ramparts: Array<SB_Rampart>;
  reserved: Array<SB_RoomPosition>;
  roads: Array<SB_Road>;
  sources: Array<SB_Source>;
  spawns: Array<SB_Spawn>;
  storages: Array<SB_Storage>;
  towers: Array<SB_Tower>;
  walls: Array<SB_Wall>;
}
