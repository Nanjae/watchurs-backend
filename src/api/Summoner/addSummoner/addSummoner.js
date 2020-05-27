import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

/**
 * ================================================================
 * 소환사 정보 생성 및 변경
 * ================================================================
 * 조건 1: 등록된 소환사
 * ================================================================
 * 조건 1-1: 소환사 이름 변경
 * ================================================================
 * 조건 2: 등록되지 않은 소환사
 * ================================================================
 * 수정 예정
 * ================================================================
 */

const getSummonerData = async (encodedSumName, RIOT_API) => {
  try {
    return await axios.get(
      `https://kr.api.riotgames.com/tft/summoner/v1/summoners/by-name/${encodedSumName}?api_key=${RIOT_API}`
    );
  } catch (e) {
    console.log(e);
    return false;
  }
};

export default {
  Mutation: {
    addSummoner: async (_, args) => {
      const RIOT_API = process.env.RIOT_DEV_API;
      const { broadId, sumName } = args;
      const encodedSumName = encodeURIComponent(sumName);

      // 소환사 데이터 불러오기
      const {
        data: {
          id: getId,
          accountId: getAccountId,
          name: getName,
          profileIconId: getProfileIconId,
          summonerLevel: getSummonerLevel,
        },
      } = await getSummonerData(encodedSumName, RIOT_API);

      const existSummoner = await prisma.$exists.summoner({
        accountId: getAccountId,
      });

      // 프로필 아이콘 렐름 : KR 버전
      const { data } = await axios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );

      // 소환사 아이콘 ddragon url
      const avatar = `http://ddragon.leagueoflegends.com/cdn/${
        data[0]
      }/img/profileicon/${getProfileIconId}.png`;

      // 조건 1: 등록된 소환사
      if (existSummoner) {
        const { id } = await prisma.summoner({ accountId: getAccountId });
        // 조건 1-1: 소환사 정보 변경
        try {
          await prisma.updateSummoner({
            where: { id },
            data: {
              name: getName,
              avatar,
              level: getSummonerLevel,
            },
          });
          await prisma.createTFTData({
            summoner: { connect: { id } },
          });
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
        // 조건 2: 등록되지 않은 소환사
      } else {
        try {
          await prisma.createSummoner({
            summonerId: getId,
            accountId: getAccountId,
            name: getName,
            avatar,
            level: getSummonerLevel,
            broadcaster: {
              connect: { broadId },
            },
            tftData: { create },
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
