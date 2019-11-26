import { prisma } from "../../../generated/prisma-client";

export default {
  Broadcaster: {
    bSummoner: ({ id }) => prisma.broadcaster({ id }).bSummoner()
  }
};
