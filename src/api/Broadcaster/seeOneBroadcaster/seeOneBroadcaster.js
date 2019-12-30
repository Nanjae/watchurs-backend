import { prisma } from "../../../../generated/prisma-client";

export default {
  Query: {
    seeOneBroadcaster: async (_, args) => {
      const { term } = args;

      const broadcaster = await prisma.broadcasters({
        where: { OR: [{ bName_contains: term }, { bId_contains: term }] }
      });

      return broadcaster;
    }
  }
};
