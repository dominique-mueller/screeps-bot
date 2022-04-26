import { Ticket } from './main';
import { flattenArray } from './utilities';

/**
 * Transfer Spawn Ticket
 */
export interface TransferSpawnTicket {
  name: 'TRANSFER_SPAWN';
  details: {
    spawnId: StructureSpawn['id'];
  };
}

/**
 * Create transfer spawn tickets
 */
export const createTransferSpawnTickets = (room: Room): Array<TransferSpawnTicket> => {
  // Find all spawns that require energy
  const spawnsThatRequireEnergy = room.find(FIND_MY_SPAWNS).filter((spawn: StructureSpawn): boolean => {
    return spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
  });

  // Find out existing transfer spawn tickets that creeps are currently working on
  const assignedTransferSpawnTickets = Object.values(Game.creeps)
    .map((creep: Creep): Ticket => {
      return creep.memory.assignedTicket;
    })
    .filter((assignedTicket: Ticket): assignedTicket is TransferSpawnTicket => {
      return assignedTicket.name === 'TRANSFER_SPAWN';
    });

  // Generate available transfer spawn tickets, taking existing transfer spawn tickets for specific spawns into account
  const availableTransferSpawnTickets: Array<TransferSpawnTicket> = flattenArray(
    spawnsThatRequireEnergy.map((spawn: StructureSpawn): Array<TransferSpawnTicket> => {
      // Find transfer spawn tickets already assigned to creeps
      const assignedTransferSpawnTicketsForSpawn = assignedTransferSpawnTickets.filter((assignedTransferSpawnTicket): boolean => {
        return assignedTransferSpawnTicket.details.spawnId === spawn['id'];
      });

      // TODO: Currently hardcoded to 2 workers per spawn
      // Ideally: Check how many locking places there are, OR how much energy is actually required
      const transferEnergyTicketPerSpawn = 2;

      // Generate tickets
      const availableTransferSpawnTicketsForSource: Array<TransferSpawnTicket> = [
        ...Array(Math.max(transferEnergyTicketPerSpawn - assignedTransferSpawnTickets.length, 0)).keys(),
      ].map((): TransferSpawnTicket => {
        return {
          name: 'TRANSFER_SPAWN',
          details: {
            spawnId: spawn['id'],
          },
        };
      });

      return availableTransferSpawnTicketsForSource;
    }),
  );

  return availableTransferSpawnTickets;
};

/**
 * Assign transfer spawn ticket
 */
export const assignTransferSpawnTicket = (creep: Creep) => {
  // Resolve
  const spawn = Game.getObjectById((creep.memory.assignedTicket as TransferSpawnTicket).details.spawnId);
  if (!spawn) {
    return;
  }

  // Execute
  const transferStatus = creep.transfer(spawn, RESOURCE_ENERGY);
  if (transferStatus === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawn, {
      visualizePathStyle: {
        stroke: '#CCC',
      },
    });
  }

  // Complete
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0 || spawn.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.assignedTicket = {
      name: 'IDLE',
    };
  }
};
