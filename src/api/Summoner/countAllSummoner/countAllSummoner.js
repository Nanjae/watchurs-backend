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
    countAllSummoner: async (_, args) => {
      const { platform } = args;
      const summoners =
        platform === undefined
          ? await prisma.summoners()
          : await prisma.summoners({
              where: { sBroadcaster: { bPlatform: platform } }
            });
      const count = summoners.length;
      return count;
    }
  }
};
