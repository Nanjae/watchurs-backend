import { prisma } from "../generated/prisma-client";
import axios from "axios";

const delayAPI = (item) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log(
        // new Date() + " : " +
        item
      );
      // console.log(process.memoryUsage().heapUsed);
      resolve();
    }, parseInt(DELAY_TIME))
  );
};

const getSummonerData = async (summonerId, RIOT_API) => {
  try {
    return await axios.get(
      `https://kr.api.riotgames.com/tft/summoner/v1/summoners/${summonerId}?api_key=${RIOT_API}`
    );
  } catch (e) {
    console.log(e.name);
    console.log(e.message);
    console.log(`${currentCount + 1}: 소환사 정보 수집 실패`);
    return false;
  }
};

const getBroadData = async (broadId, TWITCH_CID, TWITCH_SECRET) => {
  try {
    return await axios.get(
      `https://api.twitch.tv/helix/users?login=${broadId}`,
      {
        headers: {
          "Client-ID": TWITCH_CID,
          Authorization: `Bearer ${TWITCH_SECRET}`,
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
    console.log(`${currentCount + 1}: TFT 정보 수집 실패`);
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

const updateTFTFunction = async (currentCount, summoners) => {
  console.log(`${currentCount + 1} of ${maxCount}: 업데이트 시작`);

  const summonerId = summoners[currentCount].summonerId;
  const broadcaster = await prisma.broadcasters({
    where: { tftSummoners_some: { summonerId } },
  });
  const broadId = broadcaster[0].broadId;

  const {
    data: {
      data: [{ display_name: getBroadName, profile_image_url }],
    },
  } = await getBroadData(broadId, TWITCH_CID, TWITCH_SECRET);
  const getBroadAvatar = profile_image_url.replace("300x300", "70x70");
  const countSumPerBroad = await prisma
    .tFTSummonersConnection({ where: { broadcaster: { broadId } } })
    .aggregate()
    .count();

  await delayAPI(
    `${currentCount + 1} of ${maxCount}: 브로드캐스터 정보 수집 성공`
  );

  await prisma.updateBroadcaster({
    where: { broadId },
    data: { name: getBroadName, avatar: getBroadAvatar, countSumPerBroad },
  });

  console.log(
    `${currentCount + 1} of ${maxCount}: 브로드캐스터 정보 업데이트 완료`
  );

  const {
    data: {
      name: getName,
      profileIconId: getProfileIconId,
      summonerLevel: getSummonerLevel,
    },
  } = await getSummonerData(summonerId, RIOT_API);

  const { data: versionData } = await axios.get(
    `https://ddragon.leagueoflegends.com/api/versions.json`
  );

  const summonerAvatar = `http://ddragon.leagueoflegends.com/cdn/${
    versionData[0]
  }/img/profileicon/${getProfileIconId}.png`;

  await delayAPI(`${currentCount + 1} of ${maxCount}: 소환사 정보 수집 성공`);

  await prisma.updateTFTSummoner({
    where: { summonerId },
    data: {
      name: getName,
      avatar: summonerAvatar,
      level: getSummonerLevel,
    },
  });

  console.log(`${currentCount + 1} of ${maxCount}: 소환사 정보 업데이트 완료`);

  const { data: tftData } = await getTFTData(summonerId, RIOT_API);

  let tftTier = null;
  let tftRank = null;
  let tftPoints = null;
  let tftWins = null;
  let tftLosses = null;
  let tftTierNum = null;

  await delayAPI(`${currentCount + 1} of ${maxCount}: TFT 정보 수집 성공`);

  if (tftData.length === 0) {
    console.log(`${currentCount + 1} of ${maxCount}: TFT 정보 기록 없음`);
  } else {
    tftTier = tftData[0].tier;
    tftRank = tftData[0].rank;
    tftPoints = tftData[0].leaguePoints;
    tftWins = tftData[0].wins;
    tftLosses = tftData[0].losses;
    tftTierNum = await setTierNum(tftTier);

    await prisma.updateTFTSummoner({
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
    console.log(`${currentCount + 1} of ${maxCount}: TFT 정보 업데이트 완료`);
  }
  console.log(`${currentCount + 1} of ${maxCount}: 업데이트 종료`);
};

const setTFTMaxCount = async () => {
  console.log(`업데이트 사이클: 시작`);
  summoners = await prisma.tFTSummoners();
  maxCount = summoners.length;
  console.log(`업데이트 사이클: ${maxCount}회`);
};

const RIOT_API = process.env.RIOT_TFT_API;
const TWITCH_CID = process.env.TWITCH_CID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const DELAY_TIME = process.env.DELAY_TIME;
export let updateIng = process.env.UPDATE_BOOL;
let currentCount = 0;
let maxCount = 0;
let summoners = null;

export default async () => {
  updateIng = "true";
  try {
    if (maxCount === 0) {
      await setTFTMaxCount();
    }
    await updateTFTFunction(currentCount, summoners);
    if (currentCount === maxCount - 1) {
      currentCount = 0;
      console.log(`업데이트 사이클: 종료`);
    } else {
      currentCount += 1;
    }
    updateIng = "false";
  } catch (e) {
    console.log(e.name);
    console.log(e.message);
    await delayAPI(`${currentCount + 1} of ERROR: 에러 발생`);
    updateTFTFunction(currentCount, summoners);
  }
};
