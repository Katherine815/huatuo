const { deleteMedicalRecord, getPatientById, getRecordById } = require("../../utils/mockData");

Page({
  data: {
    recordId: "",
    patient: null,
    record: null,
  },

  onLoad(options) {
    this.setData({
      recordId: options.id || "",
    });

    this.refreshPage();
  },

  onShow() {
    if (this.data.recordId) {
      this.refreshPage();
    }
  },

  refreshPage() {
    const record = getRecordById(this.data.recordId);

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

  onDeleteRecord() {
    wx.showModal({
      title: "删除医疗记录",
      content: "删除后该医疗记录将从病人详情页隐藏。本地原型会软删除，后续可做回收站。",
      confirmText: "删除",
      confirmColor: "#b42318",
      success: (result) => {
        if (!result.confirm) {
          return;
        }

        const deleted = deleteMedicalRecord(this.data.record.id);

        if (!deleted) {
          wx.showToast({
            title: "删除失败，未找到记录",
            icon: "none",
          });
          return;
        }

        wx.showToast({
          title: "已删除",
          icon: "success",
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      },
    });
  },
});
