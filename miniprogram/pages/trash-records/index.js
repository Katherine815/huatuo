const {
  getDeletedRecordsByPatientId,
  getPatientByIdIncludingDeleted,
  permanentlyDeletePatientRecycleRecords,
  restorePatientRecycleRecords,
} = require("../../utils/mockData");
const cloudMedicalRecordService = require("../../services/cloudMedicalRecordService");

Page({
  data: {
    patientId: "",
    patient: null,
    records: [],
    hasRecords: false,
    title: "",
  },

  onLoad(options) {
    this.setData({
      patientId: options.patientId || "",
    });
    this.refreshPage();
  },

  onShow() {
    if (this.data.patientId) {
      this.refreshPage();
    }
  },

  refreshPage() {
    if (cloudMedicalRecordService.isCloudMode()) {
      cloudMedicalRecordService
        .getDeletedRecordsByPatientId(this.data.patientId)
        .then(({ patient, records }) => {
          if (!patient && !records.length) {
            this.handleMissingTrash();
            return;
          }

          const patientName = patient ? patient.name : "未知病人";

          this.setData({
            patient,
            records,
            hasRecords: records.length > 0,
            title: `${patientName}的医疗记录`,
          });
        })
        .catch(() => {
          this.handleMissingTrash();
        });
      return;
    }

    const patient = getPatientByIdIncludingDeleted(this.data.patientId);
    const records = getDeletedRecordsByPatientId(this.data.patientId);

    if (!patient && !records.length) {
      this.handleMissingTrash();
      return;
    }

    const patientName = patient ? patient.name : "未知病人";

    this.setData({
      patient,
      records,
      hasRecords: records.length > 0,
      title: `${patientName}的医疗记录`,
    });
  },

  handleMissingTrash() {
    wx.showToast({
      title: "回收站内容已不存在",
      icon: "none",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 800);
  },

  onOpenRecord(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/medical-record-detail/index?id=${id}&trash=1`,
    });
  },

  onRestoreAll() {
    if (cloudMedicalRecordService.isCloudMode()) {
      cloudMedicalRecordService
        .restorePatientRecycleRecords(this.data.patientId)
        .then(() => {
          wx.showToast({
            title: "已恢复",
            icon: "success",
          });

          setTimeout(() => {
            wx.navigateBack();
          }, 500);
        })
        .catch((error) => {
          wx.showToast({
            title: error.message || "恢复失败",
            icon: "none",
          });
        });
      return;
    }

    const restored = restorePatientRecycleRecords(this.data.patientId);

    wx.showToast({
      title: restored ? "已恢复" : "恢复失败",
      icon: restored ? "success" : "none",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  },

  onPermanentDeleteAll() {
    wx.showModal({
      title: "永久删除",
      content: "永久删除后无法从回收站恢复，请确认。",
      confirmText: "永久删除",
      confirmColor: "#b42318",
      success: (result) => {
        if (!result.confirm) {
          return;
        }

        if (cloudMedicalRecordService.isCloudMode()) {
          cloudMedicalRecordService
            .permanentlyDeletePatientRecycleRecords(this.data.patientId)
            .then(() => {
              wx.showToast({
                title: "已永久删除",
                icon: "success",
              });

              setTimeout(() => {
                wx.navigateBack();
              }, 500);
            })
            .catch((error) => {
              wx.showToast({
                title: error.message || "删除失败",
                icon: "none",
              });
            });
          return;
        }

        const deleted = permanentlyDeletePatientRecycleRecords(this.data.patientId);

        wx.showToast({
          title: deleted ? "已永久删除" : "删除失败",
          icon: deleted ? "success" : "none",
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      },
    });
  },
});
