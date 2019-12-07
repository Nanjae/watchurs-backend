import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 카드 내용 생성 및 그룹 등록
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Mutation: {
    setCardInfo: async (_, args) => {
      const { cPos, cLine, cBId, lCardId: id } = args;
      const CardInfo = await prisma.createCardInfo({
        cPos,
        cLine,
        cBId,
        cLeagueCard: { connect: { id } }
      });
      return CardInfo;
    }
  }
};
