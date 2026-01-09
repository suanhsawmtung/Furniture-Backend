import { prisma } from "../lib/prisma";

export const createOrUpdateSetting = async (key: string, value: string) => {
  return await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
};

export const createSetting = async (key: string, value: string) => {
  return await prisma.setting.create({
    data: { key, value },
  });
};

export const updateSetting = async (key: string, value: string) => {
  return await prisma.setting.update({
    where: { key },
    data: { value },
  });
};

export const getSettingStatus = async (key: string) => {
  return await prisma.setting.findFirst({
    where: { key },
  });
};
