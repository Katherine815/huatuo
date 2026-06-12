const { getMedicalRecordCount, getRecordsByVisitDate, searchPatients } = require("../../utils/mockData");
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
    authName: "",
    authOpenid: "",
    selectedVisitDate: "",
    dateFilterLabel: "按日期筛选",
    hasDateFilter: false,
    dateFilterButtonClass: "section-action-button filter-action-button",
    filteredRecords: [],
    hasFilteredRecords: false,
  },

  onLoad() {
    this.refreshPatients("");
    this.refreshAuthStatus();
  },

  onShow() {
    this.refreshPatients(this.data.keyword);
    this.refreshFilteredRecords();
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

  onOpenDateFilter() {
    if (this.data.hasDateFilter) {
      this.applyDateFilter("");
      return;
    }

    wx.navigateTo({
      url: `/pages/record-date-filter/index?date=${this.data.selectedVisitDate || ""}`,
      events: {
        selectDate: (payload) => {
          this.applyDateFilter(payload.date);
        },
        resetDateFilter: () => {
          this.applyDateFilter("");
        },
      },
    });
  },

  applyDateFilter(date) {
    this.setData({
      selectedVisitDate: date,
      dateFilterLabel: date ? `筛选${date}` : "按日期筛选",
      hasDateFilter: Boolean(date),
      dateFilterButtonClass: date
        ? "section-action-button filter-action-button active"
        : "section-action-button filter-action-button",
    });
    this.refreshFilteredRecords();
  },

  refreshFilteredRecords() {
    const { selectedVisitDate } = this.data;

    if (!selectedVisitDate) {
      this.setData({
        filteredRecords: [],
        hasFilteredRecords: false,
      });
      return;
    }

    if (cloudMedicalRecordService.isCloudMode()) {
      cloudMedicalRecordService
        .getRecordsByVisitDate(selectedVisitDate)
        .then((records) => {
          this.setFilteredRecords(records);
        })
        .catch((error) => {
          wx.showToast({
            title: error.message || "读取就诊记录失败",
            icon: "none",
          });
        });
      return;
    }

    this.setFilteredRecords(getRecordsByVisitDate(selectedVisitDate));
  },

  setFilteredRecords(records) {
    const filteredRecords = (records || []).map((record) => {
      return {
        ...record,
        patientName: record.patient && record.patient.name ? record.patient.name : "",
        patientNo: record.patient && record.patient.patientNo ? record.patient.patientNo : "",
      };
    });

    this.setData({
      filteredRecords,
      hasFilteredRecords: filteredRecords.length > 0,
    });
  },

  onOpenFilteredRecord(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/medical-record-detail/index?id=${id}`,
    });
  },

  onCopyAuthValue(event) {
    const { label, value } = event.currentTarget.dataset;

    if (!value) {
      return;
    }

    wx.setClipboardData({
      data: value,
      success() {
        wx.showToast({
          title: `已复制${label}`,
          icon: "success",
        });
      },
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

    wx.showModal({
      title: "导入 JSON 备份",
      content: "微信小程序不能直接打开手机 Downloads 文件夹。请先把本地 JSON 文件转发到任意微信聊天，再从聊天文件选择；或先复制 JSON 全文，小程序会自动读取系统剪贴板导入。",
      confirmText: "选择方式",
      cancelText: "取消",
      success: (modalResult) => {
        if (!modalResult.confirm) {
          return;
        }

        wx.showActionSheet({
          itemList: ["从微信聊天文件选择", "读取剪贴板中的 JSON"],
          success: (result) => {
            if (result.tapIndex === 0) {
              this.chooseJsonFromMessageFile();
              return;
            }

            this.importJsonFromClipboard();
          },
        });
      },
    });
  },

  chooseJsonFromMessageFile() {
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

  importJsonFromClipboard() {
    wx.getClipboardData({
      success: (result) => {
        this.importJsonText(result.data || "");
      },
      fail: () => {
        wx.showToast({
          title: "读取剪贴板失败",
          icon: "none",
        });
      },
    });
  },

  importJsonText(jsonText) {
    if (!jsonText.trim()) {
      wx.showToast({
        title: "剪贴板为空",
        icon: "none",
      });
      return;
    }

    let payload = null;

    try {
      payload = JSON.parse(jsonText);
    } catch (error) {
      wx.showToast({
        title: "JSON 格式不正确",
        icon: "none",
      });
      return;
    }

    this.confirmImportMode(payload);
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
        wx.hideLoading();
        this.importJsonText(fileResult.data);
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
          content: `新增病人 ${importResult.importedPatientCount || 0} 个，新增就诊记录 ${importedCount} 条，跳过重复 ${skippedCount} 条。`,
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
        authName: auth.name || "",
        authOpenid: auth.openid,
      });
    });
  },
});
