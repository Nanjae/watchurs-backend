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

// 랭크 정보가 없는 소환사 데이터
const getUnrankedData = async (sId, RIOT_API) => {
  const { data } = await axios.get(
    `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
  );
  return data;
};

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

let sTierNum = 99;

export default {
  Mutation: {
    createSummoner: async (_, args) => {
      const { sNameS, bId } = args;
      const RIOT_API = process.env.RIOT_API;
      const bInfo = await prisma.broadcaster({ bId });
      const encodedSNameS = encodeURIComponent(sNameS);
      const {
        data: { id: sId, profileIconId: sAvatar, accountId: sAccountId }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedSNameS}?api_key=${RIOT_API}`
      );
      const sAvatarUrl = `https://ddragon.leagueoflegends.com/cdn/9.23.1/img/profileicon/${sAvatar}.png`;
      const existSummoner = await prisma.$exists.summoner({ sId });

      if (!existSummoner) {
        throw error("이미 등록된 소환사입니다.");
      } else {
        try {
          try {
            const {
              summonerName: sName,
              tier: sTier,
              rank: sRank,
              leaguePoints: sPoints,
              wins: sWins,
              losses: sLosses
            } = await getRankedData(sId, RIOT_API);
            setSTierNum(sTier);
            const {
              data: { matches }
            } = await axios.get(
              `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${sAccountId}?endIndex=1&api_key=${RIOT_API}`
            );

            matches.map(async match => {
              const {
                data: {
                  participantIdentities,
                  gameMode,
                  gameType,
                  participants
                }
              } = await axios.get(
                `https://kr.api.riotgames.com/lol/match/v4/matches/${match.gameId}?api_key=${RIOT_API}`
              );
              const arrayIndex = participantIdentities.findIndex(
                x => x.player.accountId === sAccountId
              );
              console.log("모드 : " + gameMode);
              console.log("타입 : " + gameType);
              console.log("라인 : " + participants[arrayIndex].timeline.lane);
              console.log("역할 : " + participants[arrayIndex].timeline.role);
              console.log("킬 : " + participants[arrayIndex].stats.kills);
              console.log("데스 : " + participants[arrayIndex].stats.deaths);
              console.log("어시 : " + participants[arrayIndex].stats.assists);
              console.log("승패 : " + participants[arrayIndex].stats.win);
              console.log("챔피언 : " + participants[arrayIndex].championId);
            });

            // await prisma.createSummoner({
            //   sId,
            //   sName,
            //   sAvatar: sAvatarUrl,
            //   sTier,
            //   sTierNum,
            //   sRank,
            //   sPoints,
            //   sWins,
            //   sLosses,
            //   sBroadcaster: { connect: { id: bInfo.id } }
            // });
            return true;
          } catch (e) {
            // 조건 2-2 : 랭크 정보가 없는 소환사
            try {
              const { name: sName } = await getUnrankedData(sId, RIOT_API);
              // await prisma.createSummoner({
              //   sId,
              //   sName,
              //   sAvatar: sAvatarUrl,
              //   sBroadcaster: { connect: { id: bInfo.id } }
              // });
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
