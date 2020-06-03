import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

/**
 * ================================================================
 * TFT 데이터 등록
 * ================================================================
 * 수정 예정
 * ================================================================
 */

const setTierNum = async (tier) => {
  if (tier === "CHALLENGER") {
    return 1;
  } else if (tier === "GRANDMASTER") {
    return 2;
  } else if (tier === "MASTER") {
    return 3;
  } else if (tier === "DIAMOND") {
    return 4;
  } else if (tier === "PLATINUM") {
    return 5;
  } else if (tier === "GOLD") {
    return 6;
  } else if (tier === "SILVER") {
    return 7;
  } else if (tier === "BRONZE") {
    return 8;
  } else if (tier === "IRON") {
    return 9;
  } else {
    return 99;
  }
};

export default {
  Mutation: {
    addTFTData: async (_, args) => {
      const RIOT_API = process.env.RIOT_DEV_API;
      const { broadId } = args;

      const summoners = await prisma.tFTSummoners({
        where: { broadcaster: { broadId } },
      });

      for (let i = 0; i < summoners.length; i++) {
        const existTFTData = await prisma.$exists.tFTData({
          tftSummoner: { id: summoners[i].id },
        });

        try {
          const { data } = await axios.get(
            `https://kr.api.riotgames.com/tft/league/v1/entries/by-summoner/${
              summoners[i].summonerId
            }?api_key=${RIOT_API}`
          );

          if (data[0].tier !== undefined) {
            const tier = data[0].tier;
            const tierNum = await setTierNum(data[0].tier);
            const rank = data[0].rank;
            const points = data[0].leaguePoints;
            const wins = data[0].wins;
            const losses = data[0].losses;

            if (!existTFTData) {
              await prisma.createTFTData({
                tier,
                tierNum,
                rank,
                points,
                wins,
                losses,
                tftSummoner: { connect: { id: summoners[i].id } },
              });
            } else {
              await prisma.updateTFTSummoner({
                where: { id: summoners[i].id },
                data: {
                  tftData: {
                    update: {
                      tier,
                      tierNum,
                      rank,
                      points,
                      wins,
                      losses,
                    },
                  },
                },
              });
            }
          }
        } catch (e) {
          console.log(e);
          return false;
        }
      }
      return true;
    },
  },
};
