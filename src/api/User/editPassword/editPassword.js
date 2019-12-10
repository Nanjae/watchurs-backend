import { prisma } from "../../../../generated/prisma-client";
import { editPassword } from "../../../crypto";

export default {
  Mutation: {
    editPassword: async (_, args) => {
      const { uEmail, password } = args;
      try {
        const { uName } = await prisma.user({ uEmail });
        editPassword(uName, uEmail, password);
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  }
};
