import { prisma } from "../../../../generated/prisma";

/**
 * ================================================================
 * 브로드캐스터 정보 생성 및 변경
 * ================================================================
 * 조건 1: 등록된 브로드캐스터
 * ================================================================
 * 조건 1-1: 브로드캐스터 이름 변경
 * ================================================================
 * 조건 2: 등록되지 않은 브로드캐스터
 * ================================================================
 * 수정 예정
 * set의 기능을 create(new, add, etc...)와 edit으로 나눠야 할지?
 * twitch api를 통해 bAvatar 및 bLive 추가
 * ================================================================
 */

export default {
  Mutation: {
    setBroadcaster: async (_, args) => {
      const { bId, bName } = args;
      const existBroadcaster = await prisma.$exists.broadcaster({ bId });
      // 조건 1: 등록된 브로드캐스터
      if (existBroadcaster) {
        const [{ id, bName: preBName }] = await prisma.broadcasters({
          where: { bId }
        });
        // 조건 1-1: 브로드캐스터 이름 변경
        if (bName !== undefined && bName !== "" && preBName !== bName) {
          try {
            await prisma.updateBroadcaster({
              where: { id },
              data: { bName }
            });
            return true;
          } catch (e) {
            console.log(e);
            return false;
          }
        } else {
          return false;
        }
        // 조건 2: 등록되지 않은 브로드캐스터
      } else {
        try {
          await prisma.createBroadcaster({ bId, bName });
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    }
  }
};
