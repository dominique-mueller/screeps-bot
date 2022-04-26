import type { Education, Ticket } from './main';

/**
 * Creep Memory
 */
declare global {
  interface CreepMemory {
    education: Education;
    assignedTicket: Ticket;
  }
}
