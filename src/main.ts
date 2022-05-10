import { gc } from './gc';
import { assignHarvestTicket, createHarvestTickets, HarvestTicket } from './ticket.harvest';
import { assignTransferSpawnTicket, createTransferSpawnTickets, TransferSpawnTicket } from './ticket.transfer-spawn';
import { assignUpgradeControllerTicket, createUpgradeControllerTickets, UpgradeControllerTicket } from './ticket.upgrade-controller';
import { assignDefendTicket, DefendTicket } from './ticket.defend';
import { planRoom } from './plan';

export interface IdleTicket {
  name: 'IDLE';
}

export type Ticket = HarvestTicket | UpgradeControllerTicket | TransferSpawnTicket | DefendTicket | IdleTicket;

export interface EnergyWorkerEducation {
  name: 'ENERGY_WORKER';
}

export interface FighterEducation {
  name: 'FIGHTER';
}

export type Education = EnergyWorkerEducation | FighterEducation;

/**
 * Generate a unique creep name
 *
 * Note:
 * The name does not contain any information regarding what the creep does or is responsible for as creep names are always publicly visible
 * and could potentially expose confidential information (e.g. if a creep is an attacker)
 *
 * @returns Creep name
 */
const generateCreepName = (): string => {
  return `creep#${Game.time}`;
};

/**
 * Main game loop, executed on every tick
 */
export const loop = (): void => {
  // Cleanup
  gc();

  // TODO: Support for multiple rooms
  const room = Object.values(Game.rooms)[0];

  // WIP: Planning
  // planRoom(room);

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
  const energyWorkerCreepsWithoutTickets: Array<Creep> = Object.values(Game.creeps)
    .filter((creep: Creep): boolean => {
      return creep.memory.education.name === 'ENERGY_WORKER';
    })
    .filter((creep: Creep): boolean => {
      return creep.memory.assignedTicket.name === 'IDLE';
    });

  // Manage available creeps with energy
  const creepsWithEnergyWithoutTickets: Array<Creep> = energyWorkerCreepsWithoutTickets.filter((creep: Creep): boolean => {
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
  const creepsWithoutEnergyWithoutTickets: Array<Creep> = energyWorkerCreepsWithoutTickets.filter((creep: Creep): boolean => {
    return creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
  });
  creepsWithoutEnergyWithoutTickets.forEach((creep: Creep, index: number): void => {
    if (availableHarvestTickets[index]) {
      creep.memory.assignedTicket = availableHarvestTickets[index];
    }
  });

  // Manage available fighter creeps
  const isRoomAttacked = room.find(FIND_HOSTILE_CREEPS).length > 0;
  if (isRoomAttacked) {
    const fighterCreepsWithoutTickets = Object.values(Game.creeps)
      .filter((creep: Creep) => {
        return creep.memory.education.name === 'FIGHTER';
      })
      .filter((creep: Creep): boolean => {
        return creep.memory.assignedTicket.name === 'IDLE';
      });

    fighterCreepsWithoutTickets.forEach((creep: Creep): void => {
      creep.memory.assignedTicket = {
        name: 'DEFEND',
      };
    });
  }

  // Execution Management
  // ====================

  const ticketNameToAssignFunctionMap: Record<Ticket['name'], (creep: Creep) => void> = {
    HARVEST: assignHarvestTicket,
    TRANSFER_SPAWN: assignTransferSpawnTicket,
    UPGRADE_CONTROLLER: assignUpgradeControllerTicket,
    DEFEND: assignDefendTicket,
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
  const desiredNumberOfEnergyWorkerCreeps = 9;
  const existingNumberOfEnergyWorkerCreeps = Object.values(Game.creeps).filter((creep: Creep) => {
    return creep.memory.education.name === 'ENERGY_WORKER';
  }).length;

  console.log(`- Goal for Energy Worker creeps: ${existingNumberOfEnergyWorkerCreeps} ---> ${desiredNumberOfEnergyWorkerCreeps}`);

  if (existingNumberOfEnergyWorkerCreeps < desiredNumberOfEnergyWorkerCreeps) {
    const spawn: StructureSpawn | undefined = room.find(FIND_MY_SPAWNS)[0];
    if (!spawn) {
      return;
    }

    // Cost:                       100   50     50     50    50     = 300
    const energyWorkerBodyParts = [WORK, CARRY, CARRY, MOVE, MOVE];
    spawn.spawnCreep(energyWorkerBodyParts, generateCreepName(), {
      memory: {
        education: {
          name: 'ENERGY_WORKER',
        },
        assignedTicket: {
          name: 'IDLE',
        },
      },
    });
  }

  // Defense Spawn Management
  // ========================
  const existingNumberOfFighterCreeps = Object.values(Game.creeps).filter((creep: Creep) => {
    return creep.memory.education.name === 'FIGHTER';
  }).length;
  const numberOfHostileCreeps = room.find(FIND_HOSTILE_CREEPS).length;

  console.log(`- Goal for Fighter creeps: ${existingNumberOfFighterCreeps} ---> ${numberOfHostileCreeps}`);

  // Do we have hostile creeps in our room AND not enough creeps to defend?
  if (numberOfHostileCreeps > 0 && existingNumberOfFighterCreeps < numberOfHostileCreeps) {
    const spawn: StructureSpawn | undefined = room.find(FIND_MY_SPAWNS)[0];
    if (!spawn) {
      return;
    }

    // Cost:                  80      50    80      50     = 260
    const fighterBodyParts = [ATTACK, MOVE, ATTACK, MOVE];
    spawn.spawnCreep(fighterBodyParts, generateCreepName(), {
      memory: {
        education: {
          name: 'FIGHTER',
        },
        assignedTicket: {
          name: 'IDLE',
        },
      },
    });
  }

  console.log('–––––––––––––––––––– [TICK] ––––––––––––––––––––');
};
