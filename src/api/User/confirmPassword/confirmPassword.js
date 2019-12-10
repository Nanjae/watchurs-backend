import { prisma } from "../../../../generated/prisma-client";
import { comparePassword } from "../../../crypto";

export default {
  Query: {
    confirmPassword: async (_, args) => {
      const { uEmail, password } = args;
      const { uPassword, uSalt } = await prisma.user({ uEmail });
      const compareResult = await comparePassword(password, uPassword, uSalt);
      return compareResult;
    }
  }
};
