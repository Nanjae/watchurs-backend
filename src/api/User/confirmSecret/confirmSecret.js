import { prisma } from "../../../../generated/prisma-client";
import { generateToken } from "../../../utils";

export default {
  Mutation: {
    confirmSecret: async (_, args) => {
      const { secret, uEmail } = args;
      const { uLoginSecret, id } = await prisma.user({ uEmail });
      if (secret === uLoginSecret) {
        await prisma.updateUser({
          where: { id },
          data: { uLoginSecret: "" }
        });
        return generateToken(id);
      } else {
        throw Error("이메일 혹은 비밀코드가 틀립니다.");
      }
    }
  }
};
