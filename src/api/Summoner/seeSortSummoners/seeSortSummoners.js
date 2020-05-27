import { prisma } from "../../../../generated/prisma-client";
import axios from "axios";

/**
 * ================================================================
 * 소환사 조회 - 정렬
 * ================================================================
 * 수정 예정
 * ================================================================
 */

export default {
  Query: {
    seeSortSummoners: async (_, __) => {
      const unsortedSummoners = await prisma.tFTDatas();

      let sortBy = [
        {
          prop: "tierNum",
          direction: 1,
        },
        {
          prop: "rank",
          direction: 1,
        },
        {
          prop: "points",
          direction: -1,
        },
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
    },
  },
};
