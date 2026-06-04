const { getRecycleBinGroups } = require("../../utils/mockData");
const cloudMedicalRecordService = require("../../services/cloudMedicalRecordService");

Page({
  data: {
    groups: [],
    hasGroups: false,
    groupCount: 0,
  },

  onLoad() {
    this.refreshRecycleBin();
  },

  onShow() {
    this.refreshRecycleBin();

    setTimeout(() => {
      this.refreshRecycleBin();
    }, 120);
  },

  refreshRecycleBin() {
    if (cloudMedicalRecordService.isCloudMode()) {
      cloudMedicalRecordService
        .getRecycleBinGroups()
        .then((groups) => {
          this.setData({
            groups,
            hasGroups: groups.length > 0,
            groupCount: groups.length,
          });
        })
        .catch((error) => {
          wx.showToast({
            title: error.message || "读取回收站失败",
            icon: "none",
          });
        });
      return;
    }

    const groups = getRecycleBinGroups();

    this.setData({
      groups,
      hasGroups: groups.length > 0,
      groupCount: groups.length,
    });
  },

  onOpenGroup(event) {
    const { patientId } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/trash-records/index?patientId=${patientId}`,
    });
  },
});
