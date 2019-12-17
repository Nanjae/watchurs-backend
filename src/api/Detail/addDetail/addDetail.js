import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

// 갱신주기 설정 필요

export default {
  Mutation: {
    addDetail: async (_, __) => {
      const {
        data: { data: championJson }
      } = await axios.get(
        "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/ko_KR/champion.json"
      );

      const champion = Object.values(championJson).filter(x => x.key === "266");

      console.log(champion[0].id, champion[0].name);
      return true;
    }
  }
};
