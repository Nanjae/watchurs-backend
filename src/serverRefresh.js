import { prisma } from "../generated/prisma-client";
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
    }, parseInt(process.env.INTERVAL_TIME))
  );
};

export let refreshState = false;

export const serverRefresh = async () => {
  refreshState = true;
  // 소환사정보 업데이트
  await delayAPI("전체 호출 시작");
  const summoners = await prisma.summoners();
  const RIOT_API = process.env.RIOT_API;
  let count = 0;
  const MAX_COUNT = summoners.length;
  while (count < MAX_COUNT) {
    await delayAPI(count + 1 + "회 호출 시작");

    const {
      data: {
        n: { champion: vChampion, profileicon: vAvatar }
      }
    } = await axios.get("https://ddragon.leagueoflegends.com/realms/kr.json");

    const sId = summoners[count].sId;

    let sName;
    let sAvatar;
    let sAccountId;

    try {
      const {
        data: { name, profileIconId, accountId }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
      );
      sName = name;
      sAvatar = profileIconId;
      sAccountId = accountId;
      await delayAPI(count + 1 + "회 소환사 기본정보 호출 완료");
    } catch (e) {
      await delayAPI(count + 1 + "회 소환사 기본정보 호출 실패");
      const {
        data: { name, profileIconId, accountId }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${sId}?api_key=${RIOT_API}`
      );
      sName = name;
      sAvatar = profileIconId;
      sAccountId = accountId;
      await delayAPI(count + 1 + "회 소환사 기본정보 재호출 완료");
    }

    let sTier;
    let sRank;
    let sPoints;
    let sWins;
    let sLosses;

    const sAvatarUrl = `http://ddragon.leagueoflegends.com/cdn/${vAvatar}/img/profileicon/${sAvatar}.png`;
    try {
      try {
        const { tier, rank, leaguePoints, wins, losses } = await getRankedData(
          sId,
          RIOT_API
        );
        sTier = tier;
        sRank = rank;
        sPoints = leaguePoints;
        sWins = wins;
        sLosses = losses;
        await delayAPI(count + 1 + "회 소환사 랭크정보 호출 완료");
      } catch (e) {
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
      const teamsFirstRiftHerald = [
        dataTeams[0].firstRiftHerald,
        dataTeams[1].firstRiftHerald
      ];
      const teamsFirstDragon = [
        dataTeams[0].firstDragon,
        dataTeams[1].firstDragon
      ];
      const teamsFirstBaron = [
        dataTeams[0].firstBaron,
        dataTeams[1].firstBaron
      ];
      const teamsFirstTower = [
        dataTeams[0].firstTower,
        dataTeams[1].firstTower
      ];
      const teamsFirstInhibitor = [
        dataTeams[0].firstInhibitor,
        dataTeams[1].firstInhibitor
      ];
      const teamsRiftHeraldKills = [
        dataTeams[0].riftHeraldKills,
        dataTeams[1].riftHeraldKills
      ];
      const teamsDragonKills = [
        dataTeams[0].dragonKills,
        dataTeams[1].dragonKills
      ];
      const teamsBaronKills = [
        dataTeams[0].baronKills,
        dataTeams[1].baronKills
      ];
      const teamsTowerKills = [
        dataTeams[0].towerKills,
        dataTeams[1].towerKills
      ];

      let partyChampLevel = new Array(10);
      let partyKills = new Array(10);
      let partyDeaths = new Array(10);
      let partyAssists = new Array(10);
      let partyVisionScore = new Array(10);
      let partyWardsPlaced = new Array(10);
      let partyWardsKilled = new Array(10);
      let partyVisionWardsBoughtInGame = new Array(10);
      let partyLargestKillingSpree = new Array(10);
      let partyLargestMultiKill = new Array(10);
      let partyKillingSprees = new Array(10);
      let partyDoubleKills = new Array(10);
      let partyTripleKills = new Array(10);
      let partyQuadraKills = new Array(10);
      let partyPentaKills = new Array(10);
      let partyFirstBloodKill = new Array(10);
      let partyFirstBloodAssist = new Array(10);
      let partyFirstTowerKill = new Array(10);
      let partyFirstTowerAssist = new Array(10);
      let partyNeutralMinionsKilled = new Array(10);
      let partyNeutralMinionsKilledTeamJungle = new Array(10);
      let partyNeutralMinionsKilledEnemyJungle = new Array(10);
      let partyTotalDamageDealtToChampions = new Array(10);
      let partyTotalDamageDealt = new Array(10);
      let partyTotalDamageTaken = new Array(10);
      let partyTurretKills = new Array(10);
      let partyInhibitorKills = new Array(10);
      let partyDamageDealtToTurrets = new Array(10);
      let partyDamageDealtToObjectives = new Array(10);
      let partyLongestTimeSpentLiving = new Array(10);
      let partyTotalTimeCrowdControlDealt = new Array(10);
      let partyGoldEarned = new Array(10);
      let partyTotalMinionsKilled = new Array(10);
      let partyTimeCCingOthers = new Array(10);
      let partyDamageSelfMitigated = new Array(10);
      let partyTotalHeal = new Array(10);

      for (let i = 0; i < 10; i++) {
        partyChampLevel[i] = dataParticipants[i].stats.champLevel;
        partyKills[i] = dataParticipants[i].stats.kills;
        partyDeaths[i] = dataParticipants[i].stats.deaths;
        partyAssists[i] = dataParticipants[i].stats.assists;
        partyVisionScore[i] = dataParticipants[i].stats.visionScore;
        partyWardsPlaced[i] = dataParticipants[i].stats.wardsPlaced;
        partyWardsKilled[i] = dataParticipants[i].stats.wardsKilled;
        partyVisionWardsBoughtInGame[i] =
          dataParticipants[i].stats.visionWardsBoughtInGame;
        partyLargestKillingSpree[i] =
          dataParticipants[i].stats.largestKillingSpree;
        partyLargestMultiKill[i] = dataParticipants[i].stats.largestMultiKill;
        partyKillingSprees[i] = dataParticipants[i].stats.killingSprees;
        partyDoubleKills[i] = dataParticipants[i].stats.doubleKills;
        partyTripleKills[i] = dataParticipants[i].stats.tripleKills;
        partyQuadraKills[i] = dataParticipants[i].stats.quadraKills;
        partyPentaKills[i] = dataParticipants[i].stats.pentaKills;
        partyFirstBloodKill[i] = dataParticipants[i].stats.firstBloodKill;
        partyFirstBloodAssist[i] = dataParticipants[i].stats.firstBloodAssist;
        if (dataParticipants[i].stats.firstTowerKill === undefined) {
          partyFirstTowerKill[i] = false;
        } else {
          partyFirstTowerKill[i] = dataParticipants[i].stats.firstTowerKill;
        }
        if (dataParticipants[i].stats.firstTowerAssist === undefined) {
          partyFirstTowerAssist[i] = false;
        } else {
          partyFirstTowerAssist[i] = dataParticipants[i].stats.firstTowerAssist;
        }
        partyNeutralMinionsKilled[i] =
          dataParticipants[i].stats.neutralMinionsKilled;
        partyNeutralMinionsKilledTeamJungle[i] =
          dataParticipants[i].stats.neutralMinionsKilledTeamJungle;
        partyNeutralMinionsKilledEnemyJungle[i] =
          dataParticipants[i].stats.neutralMinionsKilledEnemyJungle;
        partyTotalDamageDealtToChampions[i] =
          dataParticipants[i].stats.totalDamageDealtToChampions;
        partyTotalDamageDealt[i] = dataParticipants[i].stats.totalDamageDealt;
        partyTotalDamageTaken[i] = dataParticipants[i].stats.totalDamageTaken;
        partyTurretKills[i] = dataParticipants[i].stats.turretKills;
        partyInhibitorKills[i] = dataParticipants[i].stats.inhibitorKills;
        partyDamageDealtToTurrets[i] =
          dataParticipants[i].stats.damageDealtToTurrets;
        partyDamageDealtToObjectives[i] =
          dataParticipants[i].stats.damageDealtToObjectives;
        partyLongestTimeSpentLiving[i] =
          dataParticipants[i].stats.longestTimeSpentLiving;
        partyTotalTimeCrowdControlDealt[i] =
          dataParticipants[i].stats.totalTimeCrowdControlDealt;
        partyGoldEarned[i] = dataParticipants[i].stats.goldEarned;
        partyTotalMinionsKilled[i] =
          dataParticipants[i].stats.totalMinionsKilled;
        partyTimeCCingOthers[i] = dataParticipants[i].stats.timeCCingOthers;
        partyDamageSelfMitigated[i] =
          dataParticipants[i].stats.damageSelfMitigated;
        partyTotalHeal[i] = dataParticipants[i].stats.totalHeal;
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
                  dFirstRiftHerald: { set: teamsFirstRiftHerald },
                  dFirstDragon: { set: teamsFirstDragon },
                  dFirstBaron: { set: teamsFirstBaron },
                  dFirstTower: { set: teamsFirstTower },
                  dFirstInhibitor: { set: teamsFirstInhibitor },
                  dRiftHeraldKills: { set: teamsRiftHeraldKills },
                  dDragonKills: { set: teamsDragonKills },
                  dBaronKills: { set: teamsBaronKills },
                  dTowerKills: { set: teamsTowerKills },
                  dChampLevel: { set: partyChampLevel },
                  dKills: { set: partyKills },
                  dDeaths: { set: partyDeaths },
                  dAssists: { set: partyAssists },
                  dVisionScore: { set: partyVisionScore },
                  dWardsPlaced: { set: partyWardsPlaced },
                  dWardsKilled: { set: partyWardsKilled },
                  dVisionWardsBought: { set: partyVisionWardsBoughtInGame },
                  dLargestKillingSpree: { set: partyLargestKillingSpree },
                  dLargestMultiKill: { set: partyLargestMultiKill },
                  dKillingSprees: { set: partyKillingSprees },
                  dDoubleKills: { set: partyDoubleKills },
                  dTripleKills: { set: partyTripleKills },
                  dQuadraKills: { set: partyQuadraKills },
                  dPentaKills: { set: partyPentaKills },
                  dFirstBloodKill: { set: partyFirstBloodKill },
                  dFirstBloodAssist: { set: partyFirstBloodAssist },
                  dFirstTowerKill: { set: partyFirstTowerKill },
                  dFirstTowerAssist: { set: partyFirstTowerAssist },
                  dNeutralMinionsKilled: { set: partyNeutralMinionsKilled },
                  dNeutralMinionsKilledTeamJungle: {
                    set: partyNeutralMinionsKilledTeamJungle
                  },
                  dNeutralMinionsKilledEnemyJungle: {
                    set: partyNeutralMinionsKilledEnemyJungle
                  },
                  dTotalDamageDealtToChampions: {
                    set: partyTotalDamageDealtToChampions
                  },
                  dTotalDamageDealt: { set: partyTotalDamageDealt },
                  dTotalDamageTaken: { set: partyTotalDamageTaken },
                  dTurretKills: { set: partyTurretKills },
                  dInhibitorKills: { set: partyInhibitorKills },
                  dDamageDealtToTurrets: { set: partyDamageDealtToTurrets },
                  dDamageDealtToObjectives: {
                    set: partyDamageDealtToObjectives
                  },
                  dLongestTimeSpentLiving: { set: partyLongestTimeSpentLiving },
                  dTotalTimeCrowdControlDealt: {
                    set: partyTotalTimeCrowdControlDealt
                  },
                  dGoldEarned: { set: partyGoldEarned },
                  dTotalMinionsKilled: { set: partyTotalMinionsKilled },
                  dTimeCCingOthers: { set: partyTimeCCingOthers },
                  dDamageSelfMitigated: { set: partyDamageSelfMitigated },
                  dTotalHeal: { set: partyTotalHeal }
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
    count += 1;
    if (count === MAX_COUNT) {
      await delayAPI("전체 호출 종료");
      refreshState = false;
    }
  }
};
