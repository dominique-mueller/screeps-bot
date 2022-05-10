/**
 * TODO: Out of scope for now
 *
 * - Create spawn (if not initial room)
 * - Handle room variants,
 *   - main room (controller)
 *   - mining room (sources)
 *   - travel room (nothing)
 */

import { planSpawn } from './plan.spawn';
import { planSources } from './plan.sources';
import { planController } from './plan.controller';
import { planRoads } from './plan.roads';
import { planMinerals } from './plan.minerals';
import { planExitRoads } from './plan.exit-roads';
import { planExtensions } from './plan.extensions';
import { renderRoomMapVisualization } from './debug';
import { planExits } from './plan.exits';

export interface RoomMapController {
  dockingPosition: RoomPosition;
  id: StructureController['id'];
  linkPosition: RoomPosition;
  otherDockingPositions: Array<RoomPosition>;
  position: RoomPosition;
}

export interface RoomMapMineral {
  dockingPositions: Array<RoomPosition>;
  id: Mineral['id'];
  position: RoomPosition;
}

export interface RoomMapRoad {
  position: RoomPosition;
  priority: number;
}

export interface RoomMapSpawn {
  dockingPositions: Array<RoomPosition>;
  id: StructureSpawn['id'] | null;
  position: RoomPosition;
}

export interface RoomMapSource {
  dockingPosition: RoomPosition;
  id: Source['id'];
  linkPosition: RoomPosition;
  otherDockingPositions: Array<RoomPosition>;
  position: RoomPosition;
}

export interface RoomMapWall {
  position: RoomPosition;
}

export interface RoomMapLink {
  position: RoomPosition;
}

export interface RoomMapTower {
  position: RoomPosition;
}

export interface RoomMapStorage {
  position: RoomPosition;
}

export interface RoomMapRampart {
  position: RoomPosition;
  priority: number;
}

export interface RoomMap {
  baseCenter: RoomPosition;
  controller: RoomMapController;
  links: Array<RoomMapLink>;
  minerals: Array<RoomMapMineral>;
  ramparts: Array<RoomMapRampart>;
  reserved: Array<RoomPosition>;
  roads: Array<RoomMapRoad>;
  sources: Array<RoomMapSource>;
  spawns: Array<RoomMapSpawn>;
  storages: Array<RoomMapStorage>;
  towers: Array<RoomMapTower>;
  walls: Array<RoomMapWall>;
}

/**
 * Plan room
 */
export const planRoom = (room: Room): void => {
  // INIT
  const roomMap = {
    baseCenter: undefined,
    links: [],
    minerals: [],
    ramparts: [],
    reserved: [],
    roads: [],
    sources: [],
    spawns: [],
    storages: [],
    towers: [],
    walls: [],
  } as any as RoomMap;

  // RUN
  planExits(room, roomMap);
  planSpawn(room, roomMap);
  planController(room, roomMap);
  planSources(room, roomMap);
  planMinerals(room, roomMap);
  planRoads(room, roomMap);
  planExitRoads(room, roomMap);
  planExtensions(room, roomMap);

  // DEBUG
  const debug = true;
  if (debug) {
    renderRoomMapVisualization(room, roomMap as RoomMap);
  }
};
