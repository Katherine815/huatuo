const { getMedicalRecordCount, searchPatients } = require("../../utils/mockData");
const { checkAuth } = require("../../services/authService");

Page({
  data: {
    keyword: "",
    patients: [],
    hasPatients: false,
    totalPatientCount: 0,
    totalMedicalRecordCount: 0,
    authStatus: "正在检查访问权限...",
    authMode: "checking",
    authOpenid: "",
  },

  onLoad() {
    this.refreshPatients("");
    this.refreshAuthStatus();
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
    wx.navigateTo({
      url: "/pages/patient-edit/index",
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

  refreshAuthStatus() {
    checkAuth().then((auth) => {
      this.setData({
        authStatus: auth.statusText,
        authMode: auth.mode,
        authOpenid: auth.openid,
      });
    });
  },
});
