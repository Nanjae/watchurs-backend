import { prisma } from "../generated/prisma-client";
import axios from "axios";

export let updateIng = false;

const delayAPI = (item) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log(
        // new Date() + " : " +
        item
      );
      // console.log(process.memoryUsage().heapUsed);
      resolve();
    }, parseInt("5000"))
  );
};

const getSummonerData = async (summonerId, RIOT_API) => {
  try {
    return await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}?api_key=${RIOT_API}`
    );
  } catch (e) {
    console.log(e.name);
    console.log(e.message);
    console.log(`${whileCount + 1}: 소환사 정보 수집 실패`);
    return false;
  }
};

const getBroadcasterData = async (broadId, TWITCH_CID) => {
  try {
    return await axios.get(
      `https://api.twitch.tv/helix/users?login=${broadId}`,
      {
        headers: {
          "Client-ID": TWITCH_CID,
          Authorization: "Bearer 4hm107h0r6xf1qg2cic9rlh25rz55u",
        },
      }
    );
  } catch (e) {
    console.log(e);
    return false;
  }
};

const getTFTData = async (summonerId, RIOT_API) => {
  try {
    return await axios.get(
      `https://kr.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerId}?api_key=${RIOT_API}`
    );
  } catch (e) {
    console.log(e.name);
    console.log(e.message);
    console.log(`${whileCount + 1}: TFT 정보 수집 실패`);
    return false;
  }
};

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

const updateWhileFunction = async (whileCount) => {
  const RIOT_API = process.env.RIOT_DEV_API;
  const TWITCH_CID = process.env.TWITCH_CID;

  updateIng = true;
  console.log(`업데이트 사이클: 시작`);
  let summoners = await prisma.summoners();

  let maxCount = summoners.length;

  console.log(`업데이트 사이클: ${maxCount}회`);
  while (whileCount < maxCount) {
    console.log(`${whileCount + 1} of ${maxCount}: 업데이트 시작`);

    let summonerId = summoners[whileCount].summonerId;
    let broadcaster = await prisma.broadcasters({
      where: { summoners_some: { summonerId } },
    });
    let broadId = broadcaster[0].broadId;

    let {
      data: {
        data: [{ display_name, profile_image_url }],
      },
    } = await getBroadcasterData(broadId, TWITCH_CID);
    let getBroadName = display_name;
    let getBroadAvatar = profile_image_url.replace("300x300", "70x70");
    await delayAPI(
      `${whileCount + 1} of ${maxCount}: 브로드캐스터 정보 수집 성공`
    );

    await prisma.updateBroadcaster({
      where: { broadId },
      data: { name: getBroadName, avatar: getBroadAvatar },
    });

    console.log(
      `${whileCount + 1} of ${maxCount}: 브로드캐스터 정보 업데이트 완료`
    );

    let {
      data: {
        name: getName,
        profileIconId: getProfileIconId,
        summonerLevel: getSummonerLevel,
      },
    } = await getSummonerData(summonerId, RIOT_API);

    let { data: versionData } = await axios.get(
      `https://ddragon.leagueoflegends.com/api/versions.json`
    );

    let summonerAvatar = `http://ddragon.leagueoflegends.com/cdn/${
      versionData[0]
    }/img/profileicon/${getProfileIconId}.png`;

    await delayAPI(`${whileCount + 1} of ${maxCount}: 소환사 정보 수집 성공`);

    await prisma.updateSummoner({
      where: { summonerId },
      data: {
        name: getName,
        avatar: summonerAvatar,
        level: getSummonerLevel,
      },
    });

    console.log(`${whileCount + 1} of ${maxCount}: 소환사 정보 업데이트 완료`);

    let { data: tftData } = await getTFTData(summonerId, RIOT_API);

    let tftTier = null;
    let tftRank = null;
    let tftPoints = null;
    let tftWins = null;
    let tftLosses = null;
    let tftTierNum = null;

    await delayAPI(`${whileCount + 1} of ${maxCount}: TFT 정보 수집 성공`);

    if (tftData.length === 0) {
      console.log(`${whileCount + 1} of ${maxCount}: TFT 정보 기록 없음`);
    } else {
      tftTier = tftData[0].tier;
      tftRank = tftData[0].rank;
      tftPoints = tftData[0].leaguePoints;
      tftWins = tftData[0].wins;
      tftLosses = tftData[0].losses;
      tftTierNum = await setTierNum(tftTier);

      await prisma.updateSummoner({
        where: { summonerId },
        data: {
          tftData: {
            update: {
              tier: tftTier,
              tierNum: tftTierNum,
              rank: tftRank,
              points: tftPoints,
              wins: tftWins,
              losses: tftLosses,
            },
          },
        },
      });

      console.log(`${whileCount + 1} of ${maxCount}: TFT 정보 업데이트 완료`);
    }

    console.log(`${whileCount + 1} of ${maxCount}: 업데이트 종료`);

    // GC
    summonerId = null;
    broadcaster = null;
    broadId = null;
    getBroadName = null;
    getBroadAvatar = null;
    getName = null;
    getProfileIconId = null;
    getSummonerLevel = null;
    versionData = null;
    summonerAvatar = null;
    tftData = null;
    tftTier = null;
    tftRank = null;
    tftPoints = null;
    tftWins = null;
    tftLosses = null;
    tftTierNum = null;

    whileCount += 1;

    if (whileCount === maxCount) {
      console.log(`업데이트 사이클: 종료`);

      // GC
      maxCount = null;
      whileCount = null;
      summoners = null;
      updateIng = false;

      break;
    }
  }
};

let whileCount = 0;

export default async () => {
  try {
    updateWhileFunction(0);
  } catch (e) {
    console.log(e.name);
    console.log(e.message);
    await delayAPI(`${whileCount + 1} of ERROR: 에러 발생`);
    updateWhileFunction(whileCount);
  }
};
