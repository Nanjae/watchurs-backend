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
      const unsortedSummoners = await prisma.summoners();

      let sortBy = [
        {
          prop: "sTierNum",
          direction: 1
        },
        {
          prop: "sRank",
          direction: 1
        },
        {
          prop: "sPoints",
          direction: -1
        }
      ];

      const sortedSummoners = unsortedSummoners.sort(function(a, b) {
        let i = 0,
          result = 0;
        while (i < sortBy.length && result === 0) {
          result =
            sortBy[i].direction *
            (a[sortBy[i].prop] < b[sortBy[i].prop]
              ? -1
              : a[sortBy[i].prop] > b[sortBy[i].prop]
              ? 1
              : 0);
          i++;
        }
        return result;
      });

      return sortedSummoners;
    }
  }
};
