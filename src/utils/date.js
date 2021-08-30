// import MomentUtils from '@date-io/moment';

export default class DateW extends Date {
  constructor(...props){
    if (props.length === 0) props[0] = new Date();
    super(props);
  }

  getWeek = (dowOffset = 1) => {
    dowOffset = dowOffset && typeof dowOffset === 'number' ? dowOffset : 0; //default dowOffset to zero
    const newYear = new Date(this.getFullYear(), 0, 1);
    let day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = day >= 0 ? day : day + 7;
    const daynum =
      Math.floor(
        (this.getTime() -
          newYear.getTime() -
          (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
          86400000
      ) + 1;
    let weeknum;
    //if the year starts before the middle of a week
    if (day < 4) {
      weeknum = Math.floor((daynum + day - 1) / 7) + 1;
      if (weeknum > 52) {
        const nYear = new Date(this.getFullYear() + 1, 0, 1);
        let nday = nYear.getDay() - dowOffset;
        nday = nday >= 0 ? nday : nday + 7;
        /*if the next year starts before the middle of
                  the week, it is week #1 of that year*/
        weeknum = nday < 4 ? 1 : 53;
      }
    } else {
      weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
  }

  getWeekStr = (dayOffset = 1) => {
    const week = this.getWeek(dayOffset);
    return week < 10 ? `0${week}` : week;
  };

  getYearWeekStr = (dayOffset = 1) => `${this.getFullYear()}.${this.getWeekStr(dayOffset)}`;

  static toDateTimeStr = (mode, value) => {
    let date = undefined;
    if (typeof value === 'string') {
      date = value;
      if (mode === 'time') date = value.split('T')[1];
    } else if (typeof value === 'object' && value && value._isAMomentObject) {
      switch (mode) {
        case 'date':
          date = value.format('YYYY-MM-DD');
          break;
        case 'time':
          date = value.format('HH:mm:00');
          break;
        case 'datetime':
          date = value.format('YYYY-MM-DD HH:mm:00');
          break;
        default:
          date = undefined;
      }
    }
    return date;
  };

  static
}
