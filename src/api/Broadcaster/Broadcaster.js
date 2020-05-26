import { prisma } from "../../../generated/prisma-client";

export default {
  Broadcaster: {
    summoners: ({ id }) => prisma.broadcaster({ id }).summoners(),
  },
};
