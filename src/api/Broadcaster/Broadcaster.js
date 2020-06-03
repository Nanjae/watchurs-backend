import { prisma } from "../../../generated/prisma-client";

export default {
  Broadcaster: {
    tftSummoners: ({ id }) => prisma.broadcaster({ id }).tftSummoners(),
    lolSummoners: ({ id }) => prisma.broadcaster({ id }).lolSummoners(),
  },
};
