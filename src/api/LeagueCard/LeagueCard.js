import { prisma } from "../../../generated/prisma-client";

export default {
  LeagueCard: {
    lCardInfo: ({ id }) => prisma.leagueCard({ id }).lCardInfo()
  }
};
