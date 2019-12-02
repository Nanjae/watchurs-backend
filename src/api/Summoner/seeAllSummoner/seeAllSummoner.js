import { prisma } from "../../../../generated/prisma-client";

/**
 * ================================================================
 * 소환사 전체 조회
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Query: {
    seeAllSummoner: async (_, __) => {
      const unrankedTier = await prisma.summoners({
        where: { sTier: "UNRANKED" }
      });
      const ironTier = await prisma.summoners({ where: { sTier: "IRON" } });
      const bronzeTier = await prisma.summoners({ where: { sTier: "BRONZE" } });
      const silverTier = await prisma.summoners({ where: { sTier: "SILVER" } });
      const goldTier = await prisma.summoners({ where: { sTier: "GOLD" } });
      const platinumTier = await prisma.summoners({
        where: { sTier: "PLATINUM" }
      });
      const diamondTier = await prisma.summoners({
        where: { sTier: "DIAMOND" }
      });
      const masterTier = await prisma.summoners({
        where: { sTier: "MASTER" }
      });
      const grandmasterTier = await prisma.summoners({
        where: { sTier: "GRANDMASTER" }
      });
      const challengerTier = await prisma.summoners({
        where: { sTier: "CHALLENGER" }
      });
      const ironSort = ironTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const bronzeSort = bronzeTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const silverSort = silverTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const goldSort = goldTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const platinumSort = platinumTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const diamondSort = diamondTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const masterSort = masterTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const grandmasterSort = grandmasterTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const challengerSort = challengerTier.sort((a, b) => {
        let o1 = b["sRank"];
        let o2 = a["sRank"];
        let p1 = a["sPoints"];
        let p2 = b["sPoints"];
        if (o1 > o2) return -1;
        if (o1 < o2) return 1;
        if (p1 > p2) return -1;
        if (p1 < p2) return 1;
        return 0;
      });
      const summoners = challengerSort.concat(
        grandmasterSort,
        masterSort,
        diamondSort,
        platinumSort,
        goldSort,
        silverSort,
        bronzeSort,
        ironSort,
        unrankedTier
      );
      return summoners;
    }
  }
};
