import { prisma } from "../../../../generated/prisma";
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
 * api 사용 시 sId 가 아닌 sName으로 찾을 수 있도록 변경
 * ================================================================
 */

export default {
  Mutation: {
    setSummoner: async (_, args) => {
      const { sId } = args;
      const RIOT_API = process.env.RIOT_API;
      const existSummoner = await prisma.$exists.summoner({ sId });
      // 조건 1 : 등록된 소환사 ID
      if (existSummoner) {
        const [{ id }] = await prisma.summoners({ where: { sId } });
        try {
          // 조건 1-1 : 랭크 정보가 있는 소환사
          try {
            const {
              data: [
                ,
                {
                  summonerName: sName,
                  tier: sTier,
                  rank: sRank,
                  leaguePoints: sPoints,
                  wins: sWins,
                  losses: sLosses
                }
              ]
            } = await axios.get(
              `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${sId}?api_key=${RIOT_API}`
            );
            await prisma.updateSummoner({
              where: { id },
              data: {
                sName,
                sTier,
                sRank,
                sPoints,
                sWins,
                sLosses
              }
            });
          } catch (e) {
            // 조건 1-2 : 랭크 정보가 없는 소환사
            try {
              const {
                data: { name: sName }
              } = await axios.get(
                `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
              );
              await prisma.updateSummoner({
                where: { id },
                data: { sName }
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
              data: [
                ,
                {
                  summonerName: sName,
                  tier: sTier,
                  rank: sRank,
                  leaguePoints: sPoints,
                  wins: sWins,
                  losses: sLosses
                }
              ]
            } = await axios.get(
              `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${sId}?api_key=${RIOT_API}`
            );
            await prisma.createSummoner({
              sId,
              sName,
              sTier,
              sRank,
              sPoints,
              sWins,
              sLosses
            });
          } catch (e) {
            // 조건 2-2 : 랭크 정보가 없는 소환사
            try {
              const {
                data: { name: sName }
              } = await axios.get(
                `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
              );
              await prisma.createSummoner({
                sId,
                sName
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