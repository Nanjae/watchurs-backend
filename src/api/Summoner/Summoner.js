import { prisma } from "../../../generated/prisma-client";

export default {
  Summoner: {
    broadcaster: ({ id }) => prisma.summoner({ id }).broadcaster(),
    tftData: ({ id }) => prisma.summoner({ id }).tftData(),
    lolData: ({ id }) => prisma.summoner({ id }).lolData(),
  },
};
