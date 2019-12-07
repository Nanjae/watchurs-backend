import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 소환사 전체 조회
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Mutation: {
    setLeagueCard: async (_, args) => {
      const { lCardName } = args;
      const LeagueCard = await prisma.createLeagueCard({
        lCardName
      });
      return LeagueCard;
    }
  }
};
