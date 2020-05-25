import { prisma } from "../../../../generated/prisma-client";

export default {
  Query: {
    seeOneSummoner: async (_, args) => {
      const { sId } = args;
      const summoner = await prisma.summoner({ sId });
      return summoner;
    }
  }
};
