import moment from "moment";

/**
 * Get the next lottery 'endTime', based on current date, as UTC.
 * Used by 'start-lottery' Hardhat script, only.
 */
export const getEndTime = (): number => {
  // Get current date, as UTC.
  const now = moment().utc();
  return moment()
    .add(24, "hours")
    .startOf("hour")
    .utc()
    .unix();
};
