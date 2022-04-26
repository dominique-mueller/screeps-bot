import { Ticket } from './main';

/**
 * Upgrade Control Ticket
 */
export interface UpgradeControllerTicket {
  name: 'UPGRADE_CONTROLLER';
}

/**
 * Create upgrade controller tickets
 */
export const createUpgradeControllerTickets = (room: Room): Array<UpgradeControllerTicket> => {
  // TODO: Currently hardcoded to 4 workers per spawn
  // Ideally: Check how many tickets are left??
  const ticketsPerController = 10;

  // Find out existing upgrade controller tickets that creeps are currently working on
  const assignedUpgradeControllerTickets = Object.values(Game.creeps)
    .map((creep: Creep): Ticket => {
      return creep.memory.assignedTicket;
    })
    .filter((assignedTicket: Ticket): assignedTicket is UpgradeControllerTicket => {
      return assignedTicket.name === 'UPGRADE_CONTROLLER';
    });

  // Generate available transfer spawn tickets, taking existing transfer spawn tickets for specific spawns into account
  const availableUpgradeControllerTickets: Array<UpgradeControllerTicket> = [
    ...Array(Math.max(ticketsPerController - assignedUpgradeControllerTickets.length, 0)).keys(),
  ].map((): UpgradeControllerTicket => {
    return {
      name: 'UPGRADE_CONTROLLER',
    };
  });

  return availableUpgradeControllerTickets;
};

/**
 * Assign harvest ticket
 */
export const assignUpgradeControllerTicket = (creep: Creep) => {
  // Resolve
  const controller = creep.room.controller;
  if (creep.room.controller === undefined) {
    return;
  }

  // Update state
  creep.memory.assignedTicket = {
    name: 'UPGRADE_CONTROLLER',
  };

  // Execute
  const upgradeControllerStatus = creep.upgradeController(controller as StructureController);
  if (upgradeControllerStatus === ERR_NOT_IN_RANGE) {
    creep.moveTo(controller as StructureController, {
      visualizePathStyle: {
        stroke: '#CCC',
      },
    });
  }

  // Complete
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.assignedTicket = {
      name: 'IDLE',
    };
  }
};
