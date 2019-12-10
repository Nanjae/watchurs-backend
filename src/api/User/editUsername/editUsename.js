import { prisma } from "../../../../generated/prisma-client";

export default {
  Mutation: {
    editUsername: async (_, args) => {
      const { uEmail, uName } = args;
      const existUName = await prisma.$exists.user({ where: { uEmail } });
      if (existUName) {
        throw error("이미 등록된 사용자 이름입니다.");
      }
      try {
        await prisma.updateUser({ where: { uEmail }, data: { uName } });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  }
};
