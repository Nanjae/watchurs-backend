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

const getBroadcasterData = async (broadId, TWITCH_CID) => {
  try {
    // return await axios.post(
    //   `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CID}&client_secret=uei1whkl17g06sxsfhzl5d3f2e46dl&grant_type=client_credentials`
    // );
    return await axios.get(
      `https://api.twitch.tv/helix/users?login=${broadId}`,
      {
        headers: {
          "Client-ID": TWITCH_CID,
          Authorization: "Bearer 4hm107h0r6xf1qg2cic9rlh25rz55u",
        },
      }
    );
  } catch (e) {
    console.log(e);
    return false;
  }
};

export default {
  Mutation: {
    addBroadcaster: async (_, args) => {
      const TWITCH_CID = process.env.TWITCH_CID;
      const { broadId, platform } = args;
      const existBroadcaster = await prisma.$exists.broadcaster({ broadId });

      let name = "";
      let avatar = "";

      if (platform === "TWITCH") {
        const {
          data: {
            data: [{ display_name, profile_image_url }],
          },
        } = await getBroadcasterData(broadId, TWITCH_CID);
        name = display_name;
        avatar = profile_image_url.replace("300x300", "70x70");
      } else {
        console.log("TWITCH 플랫폼이 아닙니다.");
        return false;
      }

      // 조건 1: 등록된 브로드캐스터
      if (existBroadcaster) {
        const { id } = await prisma.broadcaster({ broadId });
        // 조건 1-1: 브로드캐스터 정보 변경
        try {
          await prisma.updateBroadcaster({
            where: { id },
            data: { name, platform, avatar },
          });
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
        // 조건 2: 등록되지 않은 브로드캐스터
      } else {
        try {
          await prisma.createBroadcaster({
            broadId,
            name,
            platform,
            avatar,
          });
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    },
  },
};
