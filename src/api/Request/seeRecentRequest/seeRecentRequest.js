import { prisma } from "../../../../generated/prisma-client";

export default {
  Query: {
    seeRecentRequest: async (_, __) => {
      const request = await prisma.requests({ last: 1 });
      //   console.log(Date.parse(request[0].createdAt));
      //   console.log(Date.now());

      if (Date.now() - Date.parse(request[0].createdAt) < 60000) {
        return true;
      } else {
        return false;
      }
    }
  }
};
