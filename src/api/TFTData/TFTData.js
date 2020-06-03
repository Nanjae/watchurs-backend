import { prisma } from "../../../generated/prisma-client";

export default {
  TFTData: {
    tftSummoner: ({ id }) => prisma.tFTData({ id }).tftSummoner(),
  },
};
