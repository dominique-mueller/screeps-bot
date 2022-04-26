import { Ticket } from './main';
import { flattenArray } from './utilities';

/**
 * Harvest Ticket
 */
export interface HarvestTicket {
  name: 'HARVEST';
  details: {
    sourceId: Source['id'];
  };
}

/**
 * Create harvest tickets
 */
export const createHarvestTickets = (room: Room): Array<HarvestTicket> => {
  // Find all sources that have energy left to be harvested
  const sourcesThatCanBeHarvested: Array<Source> = room.find(FIND_SOURCES).filter((source: Source): boolean => {
    return source.energy > 0;
  });

  // Find out existing harvest tickets that creeps are currently working on
  const assignedHarvestTickets = Object.values(Game.creeps)
    .map((creep: Creep): Ticket => {
      return creep.memory.assignedTicket;
    })
    .filter((assignedTicket: Ticket): assignedTicket is HarvestTicket => {
      return assignedTicket.name === 'HARVEST';
    });

  // Generate available harvest tickets, taking existing harvest tickets for specific sources into account
  const availableHarvestTickets: Array<HarvestTicket> = flattenArray(
    sourcesThatCanBeHarvested.map((source: Source): Array<HarvestTicket> => {
      // Find harvest tickets already assigned to creeps
      const assignedHarvestTicketsForSource = assignedHarvestTickets.filter((assignedHarvestTicket): boolean => {
        return assignedHarvestTicket.details.sourceId === source['id'];
      });

      // TODO: Currently hardcoded to 3 workers per energy source
      // Ideally: Check how many locking places there are, OR place a constant miner that drops energy on harvest and let collect
      const harvestTicketPerSource = 3;

      // Generate tickets
      const availableHarvestTicketsForSource: Array<HarvestTicket> = [
        ...Array(Math.max(harvestTicketPerSource - assignedHarvestTicketsForSource.length, 0)).keys(),
      ].map((): HarvestTicket => {
        return {
          name: 'HARVEST',
          details: {
            sourceId: source['id'],
          },
        };
      });

      return availableHarvestTicketsForSource;
    }),
  );

  return availableHarvestTickets;
};

/**
 * Assign harvest ticket
 */
export const assignHarvestTicket = (creep: Creep) => {
  // Resolve
  const source = Game.getObjectById((creep.memory.assignedTicket as HarvestTicket).details.sourceId);
  if (!source) {
    return;
  }

  // Execute
  const harvestStatus = creep.harvest(source);
  if (harvestStatus === ERR_NOT_IN_RANGE) {
    creep.moveTo(source, {
      visualizePathStyle: {
        stroke: '#CCC',
      },
    });
  }

  // Complete
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.assignedTicket = {
      name: 'IDLE',
    };
  }
};
