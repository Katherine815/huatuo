const { getPatientById, getRecordsByPatientId } = require("../../utils/mockData");

Page({
  data: {
    patient: null,
    records: [],
    hasRecords: false,
  },

  onLoad(options) {
    const patient = getPatientById(options.id);

    if (!patient) {
      wx.showToast({
        title: "未找到病人",
        icon: "none",
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 800);
      return;
    }

    const records = getRecordsByPatientId(patient.id);

    this.setData({
      patient,
      records,
      hasRecords: records.length > 0,
    });
  },

  onCreateRecord() {
    wx.navigateTo({
      url: `/pages/medical-record-edit/index?patientId=${this.data.patient.id}`,
    });
  },

  onEditPatient() {
    wx.showToast({
      title: "下一步实现编辑病人",
      icon: "none",
    });
  },

  onOpenRecord(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/medical-record-detail/index?id=${id}`,
    });
  },
});
