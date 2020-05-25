import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

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

const getBroadcasterData = async (bId, TWITCH_CID) => {
  try {
    return await axios.get(`https://api.twitch.tv/helix/users?login=${bId}`, {
      headers: { "Client-ID": TWITCH_CID }
    });
  } catch (e) {
    console.log(e);
    return false;
  }
};

export default {
  Mutation: {
    setBroadcaster: async (_, args) => {
      const TWITCH_CID = process.env.TWITCH_CID;
      const { bId, bPlatform, name } = args;
      const existBroadcaster = await prisma.$exists.broadcaster({ bId });

      let bName = "";
      let bAvatar = "";

      if (bPlatform === "TWITCH") {
        const {
          data: {
            data: [{ display_name, profile_image_url }]
          }
        } = await getBroadcasterData(bId, TWITCH_CID);
        bName = display_name;
        bAvatar = profile_image_url;
      } else if (bPlatform === "AFREECATV") {
        bName = name;
        bAvatar = `http://profile.img.afreecatv.com/LOGO/${bId.substring(
          0,
          2
        )}/${bId}/${bId}.jpg`;
      } else {
        return false;
      }

      // 조건 1: 등록된 브로드캐스터
      if (existBroadcaster) {
        const { id } = await prisma.broadcaster({ bId });
        // 조건 1-1: 브로드캐스터 정보 변경
        try {
          await prisma.updateBroadcaster({
            where: { id },
            data: { bName, bPlatform, bAvatar }
          });
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
        // 조건 2: 등록되지 않은 브로드캐스터
      } else {
        try {
          await prisma.createBroadcaster({ bId, bName, bPlatform, bAvatar });
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    }
  }
};
