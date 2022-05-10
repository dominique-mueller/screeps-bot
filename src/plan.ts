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
import { RoomMap } from './plan.interfaces';

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
  // TODO: How to save building priority (only temp?)
  // TODO: How to save connections? (e.g. link of source vs. link of XYZ)
  // TODO: Prevent all that shitty mapping OR make it faster OR cache if ==> PERF!!!!!
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
