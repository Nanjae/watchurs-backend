import { prisma } from "../../../../generated/prisma-client";

export default {
  Mutation: {
    addRequest: async (_, args) => {
      const { rPlatform, rId, rName } = args;
      try {
        await prisma.createRequest({ rPlatform, rId, rName });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  }
};
