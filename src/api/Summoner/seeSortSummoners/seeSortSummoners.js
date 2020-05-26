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
    seeSortSummoners: async (_, args) => {
      const { from, count } = args;

      const summoners = await prisma.summoners({ skip: from, first: count });

      return summoners;
    },
  },
};
