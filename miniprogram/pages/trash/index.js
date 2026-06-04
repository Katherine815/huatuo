const { getRecycleBinGroups } = require("../../utils/mockData");

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
