import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

// 챔피언 번호 http://ddragon.leagueoflegends.com/cdn/9.23.1/data/ko_KR/champion.json

/**
 * ================================================================
 * 소환사 랭크 정보 생성 및 변경
 * ================================================================
 * 실행 시 RIOT API 3-3회 호출
 * ================================================================
 */

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
    addSummoner: async (_, args) => {
      const { sNameS, bId } = args;
      const RIOT_API = process.env.RIOT_API;
      const bInfo = await prisma.broadcaster({ bId });
      const encodedSNameS = encodeURIComponent(sNameS);

      const {
        data: {
          n: { profileicon: vAvatar }
        }
      } = await axios.get("https://ddragon.leagueoflegends.com/realms/kr.json");

      const {
        data: { id: sId, profileIconId: sAvatar, accountId: sAccountId }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedSNameS}?api_key=${RIOT_API}`
      );
      const sAvatarUrl = `http://ddragon.leagueoflegends.com/cdn/${vAvatar}/img/profileicon/${sAvatar}.png`;
      const existSummoner = await prisma.$exists.summoner({ sId });
      if (existSummoner) {
        console.log("이미 등록된 소환사입니다.");
        return false;
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
              `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${sAccountId}?queue=0&queue=400&queue=420&queue=430&queue=440&queue=700&endIndex=20&api_key=${RIOT_API}`
            );
            try {
              await prisma.createSummoner({
                sId,
                sAccountId,
                sName,
                sAvatar: sAvatarUrl,
                sTier,
                sTierNum,
                sRank,
                sPoints,
                sWins,
                sLosses,
                sBroadcaster: { connect: { id: bInfo.id } }
              });
              await matches.map(
                async match =>
                  await prisma.createDetail({
                    dGameId: match.gameId.toString(),
                    dSummoner: { connect: { sId } }
                  })
              );
              return true;
            } catch (e) {
              console.log(e);
              return false;
            }
          } catch (e) {
            try {
              const { name: sName } = await getUnrankedData(sId, RIOT_API);
              await prisma.createSummoner({
                sId,
                sAccountId,
                sName,
                sAvatar: sAvatarUrl,
                sBroadcaster: { connect: { id: bInfo.id } }
              });
              const {
                data: { matches }
              } = await axios.get(
                `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${sAccountId}?queue=0&queue=400&queue=420&queue=430&queue=440&queue=700&endIndex=20&api_key=${RIOT_API}`
              );
              await matches.map(
                async match =>
                  await prisma.createDetail({
                    dGameId: match.gameId.toString(),
                    dSummoner: { connect: { sId } }
                  })
              );
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
