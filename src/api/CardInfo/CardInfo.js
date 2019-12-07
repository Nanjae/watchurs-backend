import { prisma } from "../../../generated/prisma-client";

export default {
  CardInfo: {
    cLeagueCard: ({ id }) => prisma.cardInfo({ id }).cLeagueCard()
  }
};
