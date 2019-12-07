import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 소환사 카드 그룹 생성
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
