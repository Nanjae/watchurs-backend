import { prisma } from "../../../generated/prisma";

export default {
  Broadcaster: {
    bSummoner: ({ id }) => prisma.broadcaster({ id }).bSummoner()
  }
};
