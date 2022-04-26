import { gc } from './gc';
import { assignHarvestTicket, createHarvestTickets, HarvestTicket } from './ticket.harvest';
import { assignTransferSpawnTicket, createTransferSpawnTickets, TransferSpawnTicket } from './ticket.transfer-spawn';
import { assignUpgradeControllerTicket, createUpgradeControllerTickets, UpgradeControllerTicket } from './ticket.upgrade-controller';

export interface IdleTicket {
  name: 'IDLE';
}

export type Ticket = HarvestTicket | UpgradeControllerTicket | TransferSpawnTicket | IdleTicket;

/**
 * Creep Memory
 */
declare global {
  interface CreepMemory {
    assignedTicket: Ticket;
  }
}

/**
 * Main game loop, executed on every tick
 */
export const loop = (): void => {
  console.log('==========');

  // Cleanup
  gc();

  // TODO: Support for multiple rooms
  const room = Object.values(Game.rooms)[0];

  // Ticket Management
  // =================

  // Create tickets
  // TODO: Derive values better, e.g. upgrade controller tickets based on other tickets, ...
  const availableHarvestTickets: Array<HarvestTicket> = createHarvestTickets(room);
  const availableTransferSpawnTickets: Array<TransferSpawnTicket> = createTransferSpawnTickets(room);
  const availableUpgradeControllerTickets: Array<UpgradeControllerTicket> = createUpgradeControllerTickets(room);

  console.log(`- Available tickets (harvest): ${availableHarvestTickets.length}`);
  console.log(`- Available tickets (transfer-spawn): ${availableTransferSpawnTickets.length}`);
  console.log(`- Available tickets (upgrade-controller): ${availableUpgradeControllerTickets.length}`);

  // Find all creeps without a ticket (idle)
  const creepsWithoutTickets: Array<Creep> = Object.values(Game.creeps).filter((creep: Creep): boolean => {
    return creep.memory.assignedTicket.name === 'IDLE';
  });

  // Manage available creeps with energy
  const creepsWithEnergyWithoutTickets: Array<Creep> = creepsWithoutTickets.filter((creep: Creep): boolean => {
    return creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
  });
  const requiredAvailableTransferSpawnTickets = 1;
  const requiredAvailableUpgradeControllerTickets = 1;
  const availableTicketsForCreepsWithEnergy = [
    ...availableTransferSpawnTickets.slice(0, requiredAvailableTransferSpawnTickets),
    ...availableUpgradeControllerTickets.slice(0, requiredAvailableUpgradeControllerTickets),
    ...availableTransferSpawnTickets.slice(requiredAvailableTransferSpawnTickets),
    ...availableUpgradeControllerTickets.slice(requiredAvailableUpgradeControllerTickets),
  ];
  creepsWithEnergyWithoutTickets.forEach((creep: Creep, index: number): void => {
    if (availableTicketsForCreepsWithEnergy[index]) {
      creep.memory.assignedTicket = availableTicketsForCreepsWithEnergy[index];
    }
  });

  // Manage available creeps without energy
  const creepsWithoutEnergyWithoutTickets: Array<Creep> = creepsWithoutTickets.filter((creep: Creep): boolean => {
    return creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
  });
  creepsWithoutEnergyWithoutTickets.forEach((creep: Creep, index: number): void => {
    if (availableHarvestTickets[index]) {
      creep.memory.assignedTicket = availableHarvestTickets[index];
    }
  });

  // Execution Management
  // ====================

  const ticketNameToAssignFunctionMap: Record<Ticket['name'], (creep: Creep) => void> = {
    HARVEST: assignHarvestTicket,
    TRANSFER_SPAWN: assignTransferSpawnTicket,
    UPGRADE_CONTROLLER: assignUpgradeControllerTicket,
    IDLE: (_creep: Creep) => {
      // noop
    },
  };
  Object.values(Game.creeps).forEach((creep: Creep): void => {
    ticketNameToAssignFunctionMap[creep.memory.assignedTicket.name](creep);
  });

  // Spawn Management
  // ================

  // TODO: Based on avaible tickets (but not all? e.g. harvest only right now?)
  const desiredNumberOfCreeps = 6;
  const existingNumberOfCreeps = Object.keys(Game.creeps).length;

  console.log(`- Creeps progress: ${existingNumberOfCreeps} ---> ${desiredNumberOfCreeps}`);

  if (existingNumberOfCreeps <= desiredNumberOfCreeps) {
    const spawn: StructureSpawn | undefined = room.find(FIND_MY_SPAWNS)[0];
    if (!spawn) {
      return;
    }

    // TODO: Specific workers for other tickets
    const energyWokerName = `energy-worker#${Game.time}`;
    const energyWorkerBodyParts = [WORK, CARRY, MOVE];
    spawn.spawnCreep(energyWorkerBodyParts, energyWokerName, {
      memory: {
        assignedTicket: {
          name: 'IDLE',
        },
      },
    });
  }

  console.log('==========');
};
