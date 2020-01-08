import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 소환사 등록 수 조회
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Query: {
    countAllSummoner: async (_, __) => {
      const summoners = await prisma.summoners();
      const count = summoners.length;
      return count;
    }
  }
};
