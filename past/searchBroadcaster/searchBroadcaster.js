import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 브로드캐스터 검색
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Query: {
    searchBroadcaster: async (_, args) => {
      const { bName } = args;
      return await prisma.broadcasters({ where: { bName } });
    }
  }
};
