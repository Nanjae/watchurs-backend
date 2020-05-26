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
    countAllSummoners: async (_, __) => {
      return prisma
        .summonersConnection()
        .aggregate()
        .count();
    },
  },
};
