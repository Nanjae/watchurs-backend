import { prisma } from "../../../../generated/prisma";

/**
 * ================================================================
 * 브로드캐스터 정보 조회
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Query: {
    seeBroadcaster: async (_, args) => {
      const { bName } = args;
      return await prisma.broadcaster({ bName });
    }
  }
};
