import { prisma } from "../../../generated/prisma-client";

export default {
  TFTData: {
    summoner: ({ id }) => prisma.tFTData({ id }).summoner(),
  },
};
