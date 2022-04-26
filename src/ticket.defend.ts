/**
 * Defend Ticket
 */
export interface DefendTicket {
  name: 'DEFEND';
}

/**
 * Assign harvest ticket
 */
export const assignDefendTicket = (creep: Creep) => {
  // Resolve
  const closestEnemyCreep: Creep | null = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

  // Complete
  if (closestEnemyCreep === null) {
    creep.memory.assignedTicket = {
      name: 'IDLE',
    };
    return;
  }

  // Execute
  const attackStatus = creep.attack(closestEnemyCreep);
  if (attackStatus === ERR_NOT_IN_RANGE) {
    creep.moveTo(closestEnemyCreep, {
      visualizePathStyle: {
        stroke: 'red',
      },
    });
  }
};
