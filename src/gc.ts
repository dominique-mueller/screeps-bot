/**
 * Garbage collection
 */
export const gc = () => {
  // Cleanup dead creeps
  Object.keys(Memory.creeps || {}).forEach((creepName) => {
    if (!Game.creeps[creepName]) {
      delete Memory.creeps[creepName];
      console.log(`[GC] Cleand up memory of creep "${creepName}"`);
    }
  });
};
