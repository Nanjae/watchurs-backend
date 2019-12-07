import { prisma } from "../../../../generated/prisma-client";

export default {
  Query: {
    searchSummoner: (_, args) => {
      const { term } = args;
      const summoners = prisma.summoners({
        where: {
          OR: [
            { sBroadcaster: { bName_starts_with: term } },
            { sBroadcaster: { bId_contains: term } }
          ]
        }
      });
      return summoners;
    }
  }
};
