import crypto from "crypto";
import { prisma } from "../generated/prisma-client";

const CRYPTO_REPEAT_TIME = parseInt(process.env.CRYPTO_REPEAT_TIME);

export const saltedPassword = (uName, uEmail, uPassword) => {
  crypto.randomBytes(64, (err, buf) => {
    crypto.pbkdf2(
      uPassword,
      buf.toString("base64"),
      CRYPTO_REPEAT_TIME,
      64,
      "sha512",
      async (err, key) => {
        if (err) {
          throw err;
        }
        await prisma.createUser({
          uName,
          uEmail,
          uPassword: key.toString("base64"),
          uSalt: buf.toString("base64")
        });
      }
    );
  });
};

export const comparePassword = async (password, uPassword, uSalt) => {
  const cryptoPassword = crypto
    .pbkdf2Sync(password, uSalt, CRYPTO_REPEAT_TIME, 64, "sha512")
    .toString("base64");
  if (cryptoPassword === uPassword) {
    return true;
  } else {
    return false;
  }
};
