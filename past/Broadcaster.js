import { prisma } from "../../../generated/prisma-client";

export default {
  Broadcaster: {
    Summoner: ({ id }) => prisma.broadcaster({ id }).summoners(),
  },
};
