import { prisma } from "../../../generated/prisma-client";

export default {
  Detail: {
    dSummoner: ({ id }) => prisma.detail({ id }).dSummoner()
  }
};
