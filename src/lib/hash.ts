import * as bcrypt from "bcrypt";

export const hash = async (value: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedValue = await bcrypt.hash(value, salt);
  return hashedValue;
};

export const compareHashed = async (value: string, hashedValue: string) => {
  return await bcrypt.compare(value, hashedValue);
};
