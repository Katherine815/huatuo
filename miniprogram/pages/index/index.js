const { getMedicalRecordCount, searchPatients } = require("../../utils/mockData");

Page({
  data: {
    keyword: "",
    patients: [],
    hasPatients: false,
    totalPatientCount: 0,
    totalMedicalRecordCount: 0,
    authStatus: "本地原型：下一步接入云函数 OpenID 白名单",
  },

  onLoad() {
    this.refreshPatients("");
  },

  onShow() {
    this.refreshPatients(this.data.keyword);
  },

  onSearchInput(event) {
    const keyword = event.detail.value;

    this.setData({ keyword });
    this.refreshPatients(keyword);
  },

  onClearSearch() {
    this.setData({ keyword: "" });
    this.refreshPatients("");
  },

  onOpenPatient(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/patient-detail/index?id=${id}`,
    });
  },

  onCreatePatient() {
    wx.showToast({
      title: "下一步实现新增病人",
      icon: "none",
    });
  },

  refreshPatients(keyword) {
    const patients = searchPatients(keyword);
    const allPatients = searchPatients("");

    this.setData({
      patients,
      hasPatients: patients.length > 0,
      totalPatientCount: allPatients.length,
      totalMedicalRecordCount: getMedicalRecordCount(),
    });
  },
});
