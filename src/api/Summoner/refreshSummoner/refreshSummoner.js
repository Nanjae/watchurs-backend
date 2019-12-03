import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

// 랭크 정보가 있는 소환사 데이터
const getRankedData = async (sId, RIOT_API) => {
  try {
    const { data } = await axios.get(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${sId}?api_key=${RIOT_API}`
    );
    if (data[0] === undefined) return;
    if (data[0].queueType === "RANKED_SOLO_5x5") {
      return data[0];
    }
    if (data[1].queueType === "RANKED_SOLO_5x5") {
      return data[1];
    }
    if (data[2].queueType === "RANKED_SOLO_5x5") {
      return data[2];
    }
    if (data[3].queueType === "RANKED_SOLO_5x5") {
      return data[3];
    }
    return;
  } catch (e) {
    console.log(e);
    return false;
  }
};

let sTierNum = 99;

const setSTierNum = async sTier => {
  if (sTier === "CHALLANGER") {
    sTierNum = 1;
  }
  if (sTier === "GRANDMASTER") {
    sTierNum = 2;
  }
  if (sTier === "MASTER") {
    sTierNum = 3;
  }
  if (sTier === "DIAMOND") {
    sTierNum = 4;
  }
  if (sTier === "PLATINUM") {
    sTierNum = 5;
  }
  if (sTier === "GOLD") {
    sTierNum = 6;
  }
  if (sTier === "SILVER") {
    sTierNum = 7;
  }
  if (sTier === "BRONZE") {
    sTierNum = 8;
  }
  if (sTier === "IRON") {
    sTierNum = 9;
  }
};

export default {
  Mutation: {
    refreshSummoner: async (_, args) => {
      const { id, sId } = args;
      const RIOT_API = process.env.RIOT_API;
      const {
        data: { name: sName, profileIconId: sAvatar }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
      );
      const sAvatarUrl = `https://ddragon.leagueoflegends.com/cdn/9.23.1/img/profileicon/${sAvatar}.png`;
      try {
        const {
          tier: sTier,
          rank: sRank,
          leaguePoints: sPoints,
          wins: sWins,
          losses: sLosses
        } = await getRankedData(sId, RIOT_API);
        setSTierNum(sTier);
        await prisma.updateSummoner({
          where: { id },
          data: {
            sName,
            sAvatar: sAvatarUrl,
            sTier,
            sTierNum,
            sRank,
            sPoints,
            sWins,
            sLosses
          }
        });
        return true;
      } catch (e) {
        // 조건 1-2 : 랭크 정보가 없는 소환사
        try {
          await prisma.updateSummoner({
            where: { id },
            data: {
              sName,
              sAvatar: sAvatarUrl,
              sTier: "UNRANKED",
              sTierNum: 99,
              sRank: "UNRANKED",
              sPoints: 0,
              sWins: 0,
              sLosses: 0
            }
          });
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    }
  }
};
