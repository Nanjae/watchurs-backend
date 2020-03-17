import { prisma } from "../generated/prisma-client";
import axios from "axios";

// 랭크 정보가 있는 소환사 데이터
const getRankedData = async (sId, RIOT_API) => {
  try {
    const { data } = await axios.get(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${sId}?api_key=${RIOT_API}`
    );
    // console.log(data);
    // console.log(data.length);
    if (data.length !== 0) {
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
    } else {
      return {
        tier: "UNRANKED",
        rank: "UNRANKED",
        leaguePoints: 0,
        wins: 0,
        losses: 0
      };
    }
  } catch (e) {
    console.log("__1__");
    console.log(e.message);
    return;
  }
};

let sTierNum = 99;

const setSTierNum = async (sTier, sTierNum) => {
  // console.log("전 : " + sTier + " " + sTierNum);
  if (sTier === "CHALLENGER") {
    if (sTierNum !== 1) {
      sTierNum = 1;
    }
  } else if (sTier === "GRANDMASTER") {
    if (sTierNum !== 2) {
      sTierNum = 2;
    }
  } else if (sTier === "MASTER") {
    if (sTierNum !== 3) {
      sTierNum = 3;
    }
  } else if (sTier === "DIAMOND") {
    if (sTierNum !== 4) {
      sTierNum = 4;
    }
  } else if (sTier === "PLATINUM") {
    if (sTierNum !== 5) {
      sTierNum = 5;
    }
  } else if (sTier === "GOLD") {
    if (sTierNum !== 6) {
      sTierNum = 6;
    }
  } else if (sTier === "SILVER") {
    if (sTierNum !== 7) {
      sTierNum = 7;
    }
  } else if (sTier === "BRONZE") {
    if (sTierNum !== 8) {
      sTierNum = 8;
    }
  } else if (sTier === "IRON") {
    if (sTierNum !== 9) {
      sTierNum = 9;
    }
  }
  // console.log("후 : " + sTier + " " + sTierNum);
  return sTierNum;
};

const delayAPI = item => {
  return new Promise(resolve =>
    setTimeout(() => {
      console.log(new Date() + " : " + item);
      resolve();
    }, parseInt(process.env.INTERVAL_TIME))
  );
};

const getBroadcasterData = async (bId, TWITCH_CID) => {
  try {
    return await axios.get(`https://api.twitch.tv/helix/users?login=${bId}`, {
      headers: { "Client-ID": TWITCH_CID }
    });
  } catch (e) {
    console.log("__2__");
    console.log(e.message);
    return false;
  }
};

export let refreshState = false;

export const serverRefresh = async () => {
  refreshState = true;
  // 소환사정보 업데이트
  await delayAPI("전체 호출 시작");
  const summoners = await prisma.summoners();
  const RIOT_API = process.env.RIOT_API;
  const TWITCH_CID = process.env.TWITCH_CID;
  let count = 0;
  let recheck = false;
  const MAX_COUNT = summoners.length;
  while (count < MAX_COUNT) {
    await delayAPI(count + 1 + "회 호출 시작");

    const {
      data: {
        n: { champion: vChampion, profileicon: vAvatar }
      }
    } = await axios.get("https://ddragon.leagueoflegends.com/realms/kr.json");

    const sId = summoners[count].sId;

    const broadcaster = await prisma
      .summoners({
        where: { sId }
      })
      .sBroadcaster();

    const bId = broadcaster[0].sBroadcaster.bId;
    const bPlatform = broadcaster[0].sBroadcaster.bPlatform;

    let bName = "";
    let bAvatar = "";

    try {
      if (bPlatform === "TWITCH") {
        const {
          data: {
            data: [{ display_name, profile_image_url }]
          }
        } = await getBroadcasterData(bId, TWITCH_CID);
        bName = display_name;
        bAvatar = profile_image_url;
      }

      if (bPlatform === "AFREECATV") {
        bName = broadcaster[0].sBroadcaster.bName;
        bAvatar = `http://profile.img.afreecatv.com/LOGO/${bId.substring(
          0,
          2
        )}/${bId}/${bId}.jpg`;
      }
    } catch (e) {
      recheck = true;
      console.log("__3__");
      console.log(e.message);
      await delayAPI(count + 1 + "회 브로드캐스터 이름, 아바타 호출 실패");
    }

    try {
      await prisma.updateBroadcaster({
        where: { bId },
        data: { bName, bAvatar }
      });
      await delayAPI(count + 1 + "회 브로드캐스터 기본정보 호출 완료");
    } catch (e) {
      recheck = true;
      console.log("__4__");
      console.log(e.message);
      await delayAPI(count + 1 + "회 브로드캐스터 기본정보 호출 실패");
      await prisma.updateBroadcaster({
        where: { bId },
        data: { bName, bAvatar }
      });
      await delayAPI(count + 1 + "회 브로드캐스터 기본정보 재호출 완료");
    }

    let sName;
    let sAvatar;
    let sAccountId;
    let sLevel;

    try {
      const {
        data: { name, profileIconId, accountId, summonerLevel }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
      );
      sName = name;
      sAvatar = profileIconId;
      sAccountId = accountId;
      sLevel = summonerLevel;
      await delayAPI(count + 1 + "회 소환사 기본정보 호출 완료");
    } catch (e) {
      recheck = true;
      console.log("__5__");
      console.log(e.message);
      await delayAPI(count + 1 + "회 소환사 기본정보 호출 실패");
      const {
        data: { name, profileIconId, accountId, summonerLevel }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
      );
      sName = name;
      sAvatar = profileIconId;
      sAccountId = accountId;
      sLevel = summonerLevel;
      await delayAPI(count + 1 + "회 소환사 기본정보 재호출 완료");
    }

    let sTier;
    let sRank;
    let sPoints;
    let sWins;
    let sLosses;

    const sAvatarUrl = `http://ddragon.leagueoflegends.com/cdn/${vAvatar}/img/profileicon/${sAvatar}.png`;
    try {
      const { tier, rank, leaguePoints, wins, losses } = await getRankedData(
        sId,
        RIOT_API
      );
      // console.log(tier, rank, leaguePoints, wins, losses);
      sTier = tier;
      sRank = rank;
      sPoints = leaguePoints;
      sWins = wins;
      sLosses = losses;
      await delayAPI(count + 1 + "회 소환사 랭크정보 호출 완료");
    } catch (e) {
      recheck = true;
      console.log("__13__");
      console.log(e.message);
      await delayAPI(count + 1 + "회 소환사 랭크정보 호출 실패");
      const { tier, rank, leaguePoints, wins, losses } = await getRankedData(
        sId,
        RIOT_API
      );
      sTier = tier;
      sRank = rank;
      sPoints = leaguePoints;
      sWins = wins;
      sLosses = losses;
      await delayAPI(count + 1 + "회 소환사 랭크정보 재호출 완료");
    }

    try {
      sTierNum = 99;
      // console.log("셋 : " + sTierNum);
      sTierNum = await setSTierNum(sTier, sTierNum);
      // console.log("체크 : " + sTier + " " + sTierNum);
    } catch (e) {
      // console.log("리체크 : " + sTier + " " + +sTierNum);
      recheck = true;
      console.log("__6__");
      console.log(e.message);
      sTierNum = await setSTierNum(sTier, sTierNum);
    }

    if (sTierNum === 99) {
      try {
        sTierNum = await setSTierNum(sTier, sTierNum);
        // console.log("리체크 : " + sTier + " " + +sTierNum);
      } catch (e) {
        recheck = true;
        console.log("__7__");
        console.log(e.message);
        sTierNum = await setSTierNum(sTier, sTierNum);
        // console.log("리체크 : " + sTier + " " + +sTierNum);
      }
    }

    try {
      await prisma.updateSummoner({
        where: { sId },
        data: {
          sAccountId,
          sName,
          sAvatar: sAvatarUrl,
          sLevel,
          sTier,
          sTierNum,
          sRank,
          sPoints,
          sWins,
          sLosses
        }
      });
    } catch (e) {
      recheck = true;
      console.log("__9__");
      console.log(e.message);

      await prisma.updateSummoner({
        where: { sId },
        data: {
          sAccountId,
          sName,
          sAvatar: sAvatarUrl,
          sLevel,
          sTier,
          sTierNum,
          sRank,
          sPoints,
          sWins,
          sLosses
        }
      });
    }

    // 게임ID 업데이트
    let preGameId = new Array(20);
    let newGameId = new Array(20);
    let addGameId = new Array();
    let delGameId = new Array();

    const existSDetail = await prisma.$exists.detail({ dSummoner: { sId } });
    if (existSDetail) {
      const preDetail = await prisma.summoner({ sId }).sDetail();
      preDetail.map(async (detail, index) => {
        if (detail.dLane !== null) {
          preGameId[index] = detail.dGameId;
        } else if (detail.dLane === null) {
          await prisma.updateSummoner({
            where: { sId },
            data: { sDetail: { deleteMany: { dGameId: detail.dGameId } } }
          });
        }
      });
    }
    // console.log("이전20" + preGameId);

    let dataMatches;

    try {
      const {
        data: { matches }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${sAccountId}?queue=0&queue=400&queue=420&queue=430&queue=440&queue=700&endIndex=20&api_key=${RIOT_API}`
      );
      dataMatches = matches;
      await delayAPI(count + 1 + "회 소환사 매치정보 호출 완료");
    } catch (e) {
      recheck = true;
      console.log("__10__");
      console.log(e.message);
      await delayAPI(count + 1 + "회 소환사 매치정보 호출 실패");
      const {
        data: { matches }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${sAccountId}?queue=0&queue=400&queue=420&queue=430&queue=440&queue=700&endIndex=20&api_key=${RIOT_API}`
      );
      dataMatches = matches;
      await delayAPI(count + 1 + "회 소환사 매치정보 재호출 완료");
    }

    dataMatches.map((match, index) => {
      newGameId[index] = match.gameId.toString();
    });
    // console.log("최근20" + newGameId);

    for (let i = 0; i < newGameId.length; i++) {
      if (preGameId.indexOf(newGameId[i]) === -1) {
        addGameId = addGameId.concat(newGameId[i]);
      }
    }
    // console.log("추가예정" + addGameId);

    for (let i = 0; i < preGameId.length; i++) {
      if (newGameId.indexOf(preGameId[i]) === -1) {
        if (preGameId[i] !== undefined) {
          delGameId = delGameId.concat(preGameId[i]);
        }
      }
    }
    // console.log("삭제예정" + delGameId);

    if (addGameId.length > 0) {
      addGameId.map(async add => {
        await prisma.createDetail({
          dGameId: add,
          dSummoner: { connect: { sId } }
        });
      });
    }

    if (delGameId.length > 0) {
      delGameId.map(async del => {
        await prisma.updateSummoner({
          where: { sId },
          data: { sDetail: { deleteMany: { dGameId: del } } }
        });
      });
    }

    await delayAPI(
      count + 1 + "회 소환사 디테일 " + addGameId.length + "번 호출 시작"
    );

    let dataParticipantIdentities;
    let dataTeams;
    let dataParticipants;
    let dataGameDuration;

    for (let i = 0; i < addGameId.length; i++) {
      try {
        const {
          data: { participantIdentities, teams, participants, gameDuration }
        } = await axios.get(
          `https://kr.api.riotgames.com/lol/match/v4/matches/${addGameId[i]}?api_key=${RIOT_API}`
        );
        dataParticipantIdentities = participantIdentities;
        dataTeams = teams;
        dataParticipants = participants;
        dataGameDuration = gameDuration;
        await delayAPI(
          count + 1 + "회 소환사 매치정보 " + (i + 1) + "번 호출 완료"
        );
      } catch (e) {
        recheck = true;
        console.log("__11__");
        console.log(e.message);
        await delayAPI(
          count + 1 + "회 소환사 매치정보 " + (i + 1) + "번 호출 실패"
        );
        const {
          data: { participantIdentities, teams, participants, gameDuration }
        } = await axios.get(
          `https://kr.api.riotgames.com/lol/match/v4/matches/${addGameId[i]}?api_key=${RIOT_API}`
        );
        dataParticipantIdentities = participantIdentities;
        dataTeams = teams;
        dataParticipants = participants;
        dataGameDuration = gameDuration;
        await delayAPI(
          count + 1 + "회 소환사 매치정보 " + (i + 1) + "번 재호출 완료"
        );
      }

      const teamsWin = [dataTeams[0].win, dataTeams[1].win];

      let partyChampLevel = new Array(10);
      let partyKills = new Array(10);
      let partyDeaths = new Array(10);
      let partyAssists = new Array(10);

      for (let i = 0; i < 10; i++) {
        partyChampLevel[i] = dataParticipants[i].stats.champLevel;
        partyKills[i] = dataParticipants[i].stats.kills;
        partyDeaths[i] = dataParticipants[i].stats.deaths;
        partyAssists[i] = dataParticipants[i].stats.assists;
      }

      const arrayIndex = dataParticipantIdentities.findIndex(
        x => x.player.accountId === sAccountId
      );

      const {
        data: { data: championJson }
      } = await axios.get(
        `http://ddragon.leagueoflegends.com/cdn/${vChampion}/data/ko_KR/champion.json`
      );

      const pickedChampion = Object.values(championJson).filter(
        x => x.key === dataParticipants[arrayIndex].championId.toString()
      );

      const championId = pickedChampion[0].id;
      const championName = pickedChampion[0].name;

      const championAvatar = `http://ddragon.leagueoflegends.com/cdn/${vChampion}/img/champion/${championId}.png`;

      let dataParticipantFrames;

      try {
        const {
          data: {
            frames: [{ participantFrames }]
          }
        } = await axios.get(
          `https://kr.api.riotgames.com/lol/match/v4/timelines/by-match/${addGameId[i]}?api_key=${RIOT_API}`
        );
        dataParticipantFrames = participantFrames;
        await delayAPI(
          count + 1 + "회 소환사 타임라인 " + (i + 1) + "번 호출 완료"
        );
      } catch (e) {
        recheck = true;
        console.log("__12__");
        console.log(e.message);
        await delayAPI(
          count + 1 + "회 소환사 타임라인 " + (i + 1) + "번 호출 실패"
        );
        const {
          data: {
            frames: [{ participantFrames }]
          }
        } = await axios.get(
          `https://kr.api.riotgames.com/lol/match/v4/timelines/by-match/${addGameId[i]}?api_key=${RIOT_API}`
        );
        dataParticipantFrames = participantFrames;
        await delayAPI(
          count + 1 + "회 소환사 타임라인 " + (i + 1) + "번 재호출 완료"
        );
      }

      const laneFrame =
        Object.values(dataParticipantFrames).findIndex(
          x => x.participantId === arrayIndex + 1
        ) + 1;

      if (dataGameDuration > 300) {
        await prisma.updateSummoner({
          where: { sId },
          data: {
            sDetail: {
              updateMany: {
                where: { dGameId: addGameId[i] },
                data: {
                  dGameDuration: dataGameDuration,
                  dChampionName: championName,
                  dChampionAvatar: championAvatar,
                  dParticipantId: arrayIndex + 1,
                  dLane: laneFrame,
                  dWins: { set: teamsWin },
                  dChampLevel: { set: partyChampLevel },
                  dKills: { set: partyKills },
                  dDeaths: { set: partyDeaths },
                  dAssists: { set: partyAssists }
                }
              }
            }
          }
        });
      } else {
        await prisma.updateSummoner({
          where: { sId },
          data: {
            sDetail: {
              updateMany: {
                where: { dGameId: addGameId[i] },
                data: {
                  dGameDuration: dataGameDuration,
                  dChampionName: championName,
                  dChampionAvatar: championAvatar,
                  dParticipantId: arrayIndex + 1,
                  dLane: laneFrame,
                  dWins: { set: ["rematch", "rematch"] }
                }
              }
            }
          }
        });
      }
    }
    await delayAPI(count + 1 + "회 호출 종료");
    if (!recheck) {
      count += 1;
    } else if (recheck) {
      recheck = false;
    }
    if (count === MAX_COUNT) {
      await delayAPI("전체 호출 종료");
      refreshState = false;
    }
  }
};
