import { prisma } from "../../../../generated/prisma-client";

export default {
  Mutation: {
    deleteUser: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { uEmail } = args;
      try {
        await prisma.deleteUser({ uEmail });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  }
};
