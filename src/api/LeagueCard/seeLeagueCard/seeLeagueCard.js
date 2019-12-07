import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 소환사 카드 그룹 조회
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Query: {
    seeLeagueCard: async (_, args) => {
      const { id } = args;
      const user = await prisma.user({ id });
      return user;
    }
  }
};
