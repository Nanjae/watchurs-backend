import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 브로드캐스터 등록 수 조회
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Query: {
    countAllBroadcaster: async (_, __) => {
      const broadcasters = await prisma.broadcasters();
      const count = broadcasters.length;
      return count;
    }
  }
};
