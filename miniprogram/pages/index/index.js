const { getMedicalRecordCount, searchPatients } = require("../../utils/mockData");
const { checkAuth } = require("../../services/authService");
const cloudMedicalRecordService = require("../../services/cloudMedicalRecordService");

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

  onOpenTrash() {
    wx.navigateTo({
      url: "/pages/trash/index",
    });
  },

  onImportJson() {
    if (!cloudMedicalRecordService.isCloudMode()) {
      wx.showToast({
        title: "请先配置云环境",
        icon: "none",
      });
      return;
    }

    wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["json"],
      success: (result) => {
        const file = result.tempFiles && result.tempFiles[0];

        if (!file) {
          return;
        }

        this.importJsonFile(file.path);
      },
      fail: () => {
        wx.showToast({
          title: "未选择文件",
          icon: "none",
        });
      },
    });
  },

  importJsonFile(filePath) {
    const fs = wx.getFileSystemManager();

    wx.showLoading({
      title: "正在导入",
      mask: true,
    });

    fs.readFile({
      filePath,
      encoding: "utf8",
      success: (fileResult) => {
        let payload = null;

        try {
          payload = JSON.parse(fileResult.data);
        } catch (error) {
          wx.hideLoading();
          wx.showToast({
            title: "JSON 格式不正确",
            icon: "none",
          });
          return;
        }

        wx.hideLoading();
        this.confirmImportMode(payload);
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: "读取文件失败",
          icon: "none",
        });
      },
    });
  },

  confirmImportMode(payload) {
    wx.showActionSheet({
      itemList: ["智能合并", "新增导入"],
      success: (result) => {
        const importMode = result.tapIndex === 0 ? "merge" : "create";

        this.runJsonImport(payload, importMode);
      },
    });
  },

  runJsonImport(payload, importMode) {
    wx.showLoading({
      title: "正在导入",
      mask: true,
    });

    cloudMedicalRecordService
      .importMedicalRecords(payload, importMode)
      .then((importResult) => {
        const importedCount = importResult.importedRecordCount || 0;
        const skippedCount = importResult.skippedRecordCount || 0;

        wx.hideLoading();
        wx.showModal({
          title: "导入完成",
          content: `新增病人 ${importResult.importedPatientCount || 0} 个，新增医疗记录 ${importedCount} 条，跳过重复 ${skippedCount} 条。`,
          showCancel: false,
        });
        this.refreshPatients(this.data.keyword);
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({
          title: error.message || "导入失败",
          icon: "none",
        });
      });
  },

  refreshPatients(keyword) {
    if (cloudMedicalRecordService.isCloudMode()) {
      cloudMedicalRecordService
        .listPatients(keyword)
        .then((result) => {
          this.setData({
            patients: result.patients || [],
            hasPatients: result.patients && result.patients.length > 0,
            totalPatientCount: result.totalPatientCount || 0,
            totalMedicalRecordCount: result.totalMedicalRecordCount || 0,
          });
        })
        .catch((error) => {
          wx.showToast({
            title: error.message || "读取病人失败",
            icon: "none",
          });
        });
      return;
    }

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
