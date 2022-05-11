import { planBase } from './plan.base';
import { planSources } from './plan.sources';
import { planController } from './plan.controller';
import { planRoads } from './plan.roads';
import { planMinerals } from './plan.minerals';
import { planExitRoads } from './plan.exit-roads';
import { planExtensions } from './plan.extensions';
import { renderRoomMapVisualization } from './debug';
import { planExits } from './plan.exits';
import { SB_Room } from './plan.interfaces';

/**
 * Plan room
 *
 * TODO: Not handles: Room variants, in particular
 * - main room (controller)
 *   - initial room (spawn does exist) vs new room (spawn does not exist)
 * - mining room (sources)
 * - travel room (nothing)
 */
export const planRoom = (room: Room): void => {
  // INIT
  const roomMap = {
    base: undefined,
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
  } as any as SB_Room;

  // RUN
  planExits(room, roomMap);
  planBase(room, roomMap);
  planController(room, roomMap);
  planSources(room, roomMap);
  planMinerals(room, roomMap);
  planRoads(room, roomMap);
  planExitRoads(room, roomMap);
  planExtensions(room, roomMap);

  // DEBUG
  const debug = true;
  if (debug) {
    renderRoomMapVisualization(room, roomMap);
  }
};
