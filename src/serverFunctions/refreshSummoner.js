import { prisma } from "../../generated/prisma-client";
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

const delayAPI = item => {
  return new Promise(resolve =>
    setTimeout(() => {
      console.log(new Date());
      console.log(item);
      resolve();
    }, 3000)
  );
};

export let refreshState = false;

export const serverRefresh = async () => {
  refreshState = true;
  // 소환사정보 업데이트
  await delayAPI("전체 호출 시작");
  const summoners = await prisma.summoners();
  const RIOT_API = process.env.RIOT_API;
  let count = 7;
  const MAX_COUNT = 9;
  while (count < MAX_COUNT) {
    await delayAPI(count + 1 + "회 호출 시작");
    const sId = summoners[count].sId;
    const {
      data: { name: sName, profileIconId: sAvatar, accountId: sAccountId }
    } = await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
    );
    await delayAPI(count + 1 + "회 소환사 기본정보 호출 완료");
    const sAvatarUrl = `https://ddragon.leagueoflegends.com/cdn/9.23.1/img/profileicon/${sAvatar}.png`;
    try {
      const {
        tier: sTier,
        rank: sRank,
        leaguePoints: sPoints,
        wins: sWins,
        losses: sLosses
      } = await getRankedData(sId, RIOT_API);
      await delayAPI(count + 1 + "회 소환사 랭크정보 호출 완료");
      setSTierNum(sTier);
      await prisma.updateSummoner({
        where: { sId },
        data: {
          sAccountId,
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
    } catch (e) {
      try {
        await prisma.updateSummoner({
          where: { sId },
          data: {
            sAccountId,
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
      } catch (e) {
        console.log(e);
        return false;
      }
    }

    // 게임ID 업데이트
    let preGameId = new Array(20);
    let newGameId = new Array(20);
    let addGameId = new Array();
    let delGameId = new Array();

    const existSDetail = await prisma.$exists.detail({ dSummoner: { sId } });
    if (existSDetail) {
      await prisma.updateSummoner({
        where: { sId },
        data: { sDetail: { deleteMany: { dLane: null } } }
      });
      const preDetail = await prisma.summoner({ sId }).sDetail();
      preDetail.map((detail, index) => {
        preGameId[index] = detail.dGameId;
      });
    }

    const {
      data: { matches }
    } = await axios.get(
      `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${sAccountId}?queue=0&queue=400&queue=420&queue=430&queue=440&queue=700&endIndex=20&api_key=${RIOT_API}`
    );
    await delayAPI(count + 1 + "회 소환사 매치정보 호출 완료");

    matches.map((match, index) => {
      newGameId[index] = match.gameId.toString();
    });

    for (let i = 0; i < newGameId.length; i++) {
      if (preGameId.indexOf(newGameId[i]) === -1) {
        addGameId = addGameId.concat(newGameId[i]);
      }
    }
    // console.log(addGameId);

    for (let i = 0; i < preGameId.length; i++) {
      if (newGameId.indexOf(preGameId[i]) === -1) {
        delGameId = delGameId.concat(preGameId[i]);
      }
    }
    // console.log(delGameId);

    addGameId.map(async add => {
      await prisma.createDetail({
        dGameId: add,
        dSummoner: { connect: { sId } }
      });
    });

    delGameId.map(async del => {
      prisma.updateSummoner({
        where: { sId },
        data: { sDetail: { deleteMany: { dGameId: del } } }
      });
    });

    await delayAPI(
      count + 1 + "회 소환사 디테일 " + addGameId.length + "번 호출 시작"
    );

    for (let i = 0; i < addGameId.length; i++) {
      const {
        data: { participantIdentities, gameMode, gameType, participants }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/match/v4/matches/${addGameId[i]}?api_key=${RIOT_API}`
      );
      await delayAPI(
        count + 1 + "회 소환사 디테일 " + (i + 1) + "번 호출 완료"
      );
      const arrayIndex = participantIdentities.findIndex(
        x => x.player.accountId === sAccountId
      );
      await prisma.updateSummoner({
        where: { sId },
        data: {
          sDetail: {
            updateMany: {
              where: { dGameId: addGameId[i] },
              data: {
                dGameMode: gameMode,
                dGameType: gameType,
                dLane: participants[arrayIndex].timeline.lane,
                dRole: participants[arrayIndex].timeline.role,
                dKills: participants[arrayIndex].stats.kills,
                dDeaths: participants[arrayIndex].stats.deaths,
                dAssists: participants[arrayIndex].stats.assists,
                dWins: participants[arrayIndex].stats.win,
                dChampionId: participants[arrayIndex].championId
              }
            }
          }
        }
      });
    }
    await delayAPI(count + 1 + "회 호출 종료");
    count += 1;
    if (count === MAX_COUNT) {
      await delayAPI("전체 호출 종료");
      refreshState = false;
    }
  }
};
