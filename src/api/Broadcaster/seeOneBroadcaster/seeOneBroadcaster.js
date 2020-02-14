import { prisma } from "../../../../generated/prisma-client";

export default {
  Query: {
    seeOneBroadcaster: async (_, args) => {
      const { term } = args;
      const existBroadcaster = await prisma.$exists.broadcaster({
        OR: [{ bName: term }, { bId: term }]
      });

      if (existBroadcaster) {
        return await prisma.broadcasters({
          where: { OR: [{ bName: term }, { bId: term }] }
        });
      } else {
        return null;
      }
    }
  }
};
