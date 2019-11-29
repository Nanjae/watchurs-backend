import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

/**
 * ================================================================
 * 소환사 랭크 정보 생성 및 변경
 * ================================================================
 * 조건 1 : 등록된 소환사 ID
 * ================================================================
 * 조건 1-1 : 랭크 정보가 있는 소환사
 * 조건 1-2 : 랭크 정보가 없는 소환사
 * ================================================================
 * 조건 2 : 등록되지 않은 소환사 ID
 * ================================================================
 * 조건 2-1 : 랭크 정보가 있는 소환사
 * 조건 2-2 : 랭크 정보가 없는 소환사
 * ================================================================
 * 수정 예정
 * ================================================================
 */

// 랭크 정보가 있는 소환사 데이터
const getRankedData = async (sId, RIOT_API) => {
  try {
    const { data } = await axios.get(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${sId}?api_key=${RIOT_API}`
    );
    if (data[0].queueType === "RANKED_SOLO_5x5") {
      return data[0];
    } else {
      return data[1];
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};

// 랭크 정보가 없는 소환사 데이터
const getUnrankedData = async (sId, RIOT_API) => {
  const { data } = await axios.get(
    `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
  );
  return data;
};

export default {
  Mutation: {
    setSummoner: async (_, args) => {
      const { sNameS, bId, bName } = args;
      const RIOT_API = process.env.RIOT_API;
      const bInfo = await prisma.broadcasters({
        where: { AND: [{ bId }, { bName }] }
      });
      const encodedSNameS = encodeURIComponent(sNameS);
      const {
        data: { id: sId }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedSNameS}?api_key=${RIOT_API}`
      );
      const existSummoner = await prisma.$exists.summoner({ sId });
      // 조건 1 : 등록된 소환사 ID
      if (existSummoner) {
        const [{ id }] = await prisma.summoners({ where: { sId } });
        try {
          // 조건 1-1 : 랭크 정보가 있는 소환사
          try {
            const {
              summonerName: sName,
              tier: sTier,
              rank: sRank,
              leaguePoints: sPoints,
              wins: sWins,
              losses: sLosses
            } = await getRankedData(sId, RIOT_API);
            await prisma.updateSummoner({
              where: { id },
              data: {
                sId,
                sName,
                sTier,
                sRank,
                sPoints,
                sWins,
                sLosses,
                sBroadcaster: { connect: { id: bInfo[0].id } }
              }
            });
            return true;
          } catch (e) {
            // 조건 1-2 : 랭크 정보가 없는 소환사
            try {
              const { name: sName } = await getUnrankedData(sId, RIOT_API);
              await prisma.updateSummoner({
                where: { id },
                data: {
                  sId,
                  sName,
                  sBroadcaster: { connect: { id: bInfo[0].id } }
                }
              });
              return true;
            } catch (e) {
              console.log(e);
              return false;
            }
          }
        } catch (e) {
          console.log(e);
          return false;
        }
        // 조건 2 : 등록되지 않은 소환사 ID
      } else {
        try {
          // 조건 2-1 : 랭크 정보가 있는 소환사
          try {
            const {
              summonerName: sName,
              tier: sTier,
              rank: sRank,
              leaguePoints: sPoints,
              wins: sWins,
              losses: sLosses
            } = await getRankedData(sId, RIOT_API);
            await prisma.createSummoner({
              sId,
              sName,
              sTier,
              sRank,
              sPoints,
              sWins,
              sLosses,
              sBroadcaster: { connect: { id: bInfo[0].id } }
            });
            return true;
          } catch (e) {
            // 조건 2-2 : 랭크 정보가 없는 소환사
            try {
              const { name: sName } = await getUnrankedData(sId, RIOT_API);
              await prisma.createSummoner({
                sId,
                sName,
                sBroadcaster: { connect: { id: bInfo[0].id } }
              });
              return true;
            } catch (e) {
              console.log(e);
              return false;
            }
          }
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    }
  }
};
