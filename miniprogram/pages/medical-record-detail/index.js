const { getPatientById, getRecordById } = require("../../utils/mockData");

Page({
  data: {
    patient: null,
    record: null,
  },

  onLoad(options) {
    const record = getRecordById(options.id);

    if (!record) {
      wx.showToast({
        title: "未找到医疗记录",
        icon: "none",
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 800);
      return;
    }

    this.setData({
      record,
      patient: getPatientById(record.patientId),
    });
  },

  onEditRecord() {
    wx.navigateTo({
      url: `/pages/medical-record-edit/index?id=${this.data.record.id}`,
    });
  },
});
