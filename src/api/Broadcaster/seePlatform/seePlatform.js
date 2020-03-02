import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 브로드캐스터 단일 조회
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Query: {
    seePlatform: async (_, args) => {
      const { bPlatform } = args;
      const broadcasters = await prisma.broadcasters({ where: { bPlatform } });
      return broadcasters;
    }
  }
};
