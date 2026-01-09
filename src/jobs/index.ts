import { maintenanceJob } from "./maintenance.job";

export const startCronJobs = () => {
  maintenanceJob.start();
};
