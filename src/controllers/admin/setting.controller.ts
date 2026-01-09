import { NextFunction, Response } from "express";
import { createOrUpdateSetting } from "../../services/setting.service";
import { CustomRequest } from "../../types/common";

export const setMaintenance = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const value = req.body.value;

  const maintenanceData = await createOrUpdateSetting("maintenance", value);

  res.status(200).json({
    message: `Successfully set maintenance mode ${maintenanceData.value}`,
    maintenance: maintenanceData,
  });
};
