import { prisma } from "../../../../generated/prisma-client";
import { comparePassword } from "../../../crypto";
import { generateToken } from "../../../utils";

export default {
  Query: {
    confirmPassword: async (_, args) => {
      const { uEmail, password } = args;
      const { uPassword, uSalt, id } = await prisma.user({ uEmail });
      const compareResult = await comparePassword(password, uPassword, uSalt);
      if (compareResult) {
        return generateToken(id);
      } else {
        throw error("이메일 혹은 비밀번호가 틀립니다.");
      }
    }
  }
};
