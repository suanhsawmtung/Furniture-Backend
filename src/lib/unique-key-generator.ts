import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

export const generateOTP = () => {
  return (parseInt(randomBytes(3).toString("hex"), 16) % 900000) + 100000;
};

export const generateToken = () => {
  return randomBytes(32).toString("hex");
};

export const generateCode = (size: number) => {
  return randomBytes(size).toString("hex"); // 2 bytes = 4 hex characters
};

export const generateJWT = ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: string;
  options: jwt.SignOptions;
}) => {
  return jwt.sign(payload, secret, options);
};
