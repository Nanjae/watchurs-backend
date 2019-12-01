import { prisma } from "../../../generated/prisma-client";

export default {
  Summoner: {
    sBroadcaster: ({ id }) => prisma.summoner({ id }).sBroadcaster()
  }
};
