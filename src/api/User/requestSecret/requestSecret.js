import { sendSecretMail } from "../../../utils";
import { prisma } from "../../../../generated/prisma-client";

export default {
  Mutation: {
    requestSecret: async (_, args) => {
      const { uEmail } = args;
      const uLoginSecret = Math.floor(100000 + Math.random() * 900000);
      try {
        await sendSecretMail(uEmail, uLoginSecret);
        await prisma.updateUser({ data: { uLoginSecret }, where: { uEmail } });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  }
};
