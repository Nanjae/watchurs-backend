import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

// 갱신주기 설정 필요

export default {
  Mutation: {
    addDetail: async (_, args) => {
      const { sId } = args;
      const RIOT_API = process.env.RIOT_API;
      const { sAccountId } = await prisma.summoner({ sId });
      const sDetail = await prisma.summoner({ sId }).sDetail();
      const dGameId = sDetail.map(detail => detail.dGameId);
      const {
        data: { participantIdentities, gameMode, gameType, participants }
      } = await axios.get(
        `https://kr.api.riotgames.com/lol/match/v4/matches/${dGameId[0]}?api_key=${RIOT_API}`
      );
      const arrayIndex = participantIdentities.findIndex(
        x => x.player.accountId === sAccountId
      );

      await prisma.updateDetail({
        where: { id: sDetail[0].id },
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
      });

      return true;
    }
  }
};
