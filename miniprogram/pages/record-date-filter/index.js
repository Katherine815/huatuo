const { getRecordDateCounts } = require("../../utils/mockData");
const cloudMedicalRecordService = require("../../services/cloudMedicalRecordService");

function padTwo(value) {
  const text = String(value);
  return text.length >= 2 ? text : `0${text}`;
}

function formatDate(year, month, day) {
  return `${year}-${padTwo(month)}-${padTwo(day)}`;
}

function getMonthTitle(year, month) {
  return `${year}年${month}月`;
}

Page({
  data: {
    year: 0,
    month: 0,
    monthTitle: "",
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    days: [],
  },

  didSelectDate: false,

  onLoad(options) {
    const baseDate = options.date ? new Date(options.date) : new Date();
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth() + 1;

    this.setData({
      year,
      month,
    });
    this.refreshCalendar(year, month);
  },

  onUnload() {
    if (this.didSelectDate) {
      return;
    }

    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit("resetDateFilter");
  },

  refreshCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    this.getRecordCountByDate(year, month).then((recordCountByDate) => {
      const days = [];

      for (let i = 0; i < firstDay; i++) {
        days.push({
          key: `empty-${i}`,
          isEmpty: true,
          className: "day-cell empty",
        });
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = formatDate(year, month, day);
        const recordCount = recordCountByDate[date] || 0;

        days.push({
          key: date,
          date,
          day,
          recordCount,
          hasRecord: recordCount > 0,
          className: recordCount > 0 ? "day-cell has-record" : "day-cell",
        });
      }

      this.setData({
        year,
        month,
        monthTitle: getMonthTitle(year, month),
        days,
      });
    });
  },

  getRecordCountByDate(year, month) {
    if (!cloudMedicalRecordService.isCloudMode()) {
      return Promise.resolve(getRecordDateCounts(year, month));
    }

    return cloudMedicalRecordService.getRecordDateCounts(year, month);
  },

  onPreviousMonth() {
    let { year, month } = this.data;

    month -= 1;
    if (month < 1) {
      year -= 1;
      month = 12;
    }

    this.refreshCalendar(year, month);
  },

  onNextMonth() {
    let { year, month } = this.data;

    month += 1;
    if (month > 12) {
      year += 1;
      month = 1;
    }

    this.refreshCalendar(year, month);
  },

  onSelectDate(event) {
    const { date } = event.currentTarget.dataset;

    if (!date) {
      return;
    }

    this.didSelectDate = true;

    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit("selectDate", { date });

    wx.navigateBack();
  },
});
