import { prisma } from "../../../generated/prisma-client";

export default {
  TFTSummoner: {
    broadcaster: ({ id }) => prisma.tFTSummoner({ id }).broadcaster(),
    tftData: ({ id }) => prisma.tFTSummoner({ id }).tftData(),
  },
};
