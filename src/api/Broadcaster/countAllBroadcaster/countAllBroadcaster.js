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
    countAllBroadcaster: async (_, args) => {
      const { platform } = args;
      const broadcasters =
        platform === undefined
          ? await prisma.broadcasters()
          : await prisma.broadcasters({
              where: { bPlatform: platform }
            });
      const count = broadcasters.length;
      return count;
    }
  }
};
