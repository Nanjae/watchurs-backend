/**
 * ================================================================
 * 서버 시간 체크
 * ================================================================
 * 년 월 일 시 분
 * ================================================================
 * 수정예정
 * ================================================================
 */

export default {
  Query: {
    dateServer: async (_, __) => {
      const Time = new Date();
      const timeYear = Time.getUTCFullYear();
      let timeMonth = "" + (Time.getUTCMonth() + 1);
      let timeDate = "" + Time.getUTCDate();
      let timeHours = "" + Time.getUTCHours();
      let timeMinutes = "" + Time.getUTCMinutes();
      let timeSeconds = "" + Time.getUTCSeconds();

      if (timeMonth.length < 2) {
        timeMonth = "0" + timeMonth;
      }
      if (timeDate.length < 2) {
        timeDate = "0" + timeDate;
      }
      if (timeHours.length < 2) {
        timeHours = "0" + timeHours;
      }
      if (timeMinutes.length < 2) {
        timeMinutes = "0" + timeMinutes;
      }
      if (timeSeconds.length < 2) {
        timeSeconds = "0" + timeSeconds;
      }

      const serverTime = `${timeYear}-${timeMonth}-${timeDate}T${timeHours}:${timeMinutes}:${timeSeconds}`;

      return serverTime;
    }
  }
};
