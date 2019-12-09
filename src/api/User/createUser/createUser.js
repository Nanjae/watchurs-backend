import { prisma } from "../../../../generated/prisma-client";

export default {
  Mutation: {
    createUser: async (_, args) => {
      const { uName, uEmail, uPassword } = args;
      const existUName = await prisma.$exists.user({ uName });
      const existUEmail = await prisma.$exists.user({ uEmail });
      if (existUName) {
        throw Error("이미 등록된 사용자 이름 입니다.");
      } else if (existUEmail) {
        throw Error("이미 등록된 이메일 입니다.");
      }
      await prisma.createUser({
        uName,
        uEmail,
        uPassword
      });
      return true;
    }
  }
};
