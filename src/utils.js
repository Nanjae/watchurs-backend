import sgMail from "@sendgrid/mail";

const sendMail = email => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  return sgMail.send(email);
};

export const sendSecretMail = (address, secret) => {
  const email = {
    from: "dngngn3045@watchurs.com",
    to: address,
    subject: "🔒와쳐스 WATCHURS.COM 인증 메일🔒",
    html: `와쳐스 가입을 환영합니다!<br/>이메일 인증 페이지에 <strong>${secret}</strong> 을 입력해주세요.`
  };
  return sendMail(email);
};
