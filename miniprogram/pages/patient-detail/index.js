const { deletePatient, getPatientById, getRecordsByPatientId } = require("../../utils/mockData");
const { exportPatientMedicalRecords } = require("../../services/exportService");
const cloudMedicalRecordService = require("../../services/cloudMedicalRecordService");

Page({
  data: {
    patientId: "",
    patient: null,
    allRecords: [],
    records: [],
    hasRecords: false,
    hasAnyRecords: false,
  },

  onLoad(options) {
    this.setData({
      patientId: options.id || "",
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
      Promise.all([
        cloudMedicalRecordService.getPatientById(this.data.patientId),
        cloudMedicalRecordService.getRecordsByPatientId(this.data.patientId),
      ])
        .then(([patient, allRecords]) => {
          this.setData({
            patient,
            allRecords,
            records: allRecords,
            hasRecords: allRecords.length > 0,
            hasAnyRecords: allRecords.length > 0,
          });
        })
        .catch(() => {
          this.handleMissingPatient();
        });
      return;
    }

    const patient = getPatientById(this.data.patientId);

    if (!patient) {
      this.handleMissingPatient();
      return;
    }

    const allRecords = getRecordsByPatientId(patient.id);

    this.setData({
      patient,
      allRecords,
      records: allRecords,
      hasRecords: allRecords.length > 0,
      hasAnyRecords: allRecords.length > 0,
    });
  },

  handleMissingPatient() {
    wx.showToast({
      title: "未找到病人",
      icon: "none",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 800);
  },

  onCreateRecord() {
    wx.navigateTo({
      url: `/pages/medical-record-create/index?patientId=${this.data.patient.id}`,
    });
  },

  onEditPatient() {
    wx.navigateTo({
      url: `/pages/patient-edit/index?id=${this.data.patient.id}`,
    });
  },

  onExportPatientRecords() {
    exportPatientMedicalRecords(this.data.patient, this.data.allRecords);
  },

  onDeletePatient() {
    wx.showModal({
      title: "删除病人",
      content: "删除后该病人和名下就诊记录会移入回收站，可在 30 天内恢复。",
      confirmText: "删除",
      confirmColor: "#b42318",
      success: (result) => {
        if (!result.confirm) {
          return;
        }

        if (cloudMedicalRecordService.isCloudMode()) {
          cloudMedicalRecordService
            .deletePatient(this.data.patient.id)
            .then(() => {
              wx.showToast({
                title: "已删除",
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

        const deleted = deletePatient(this.data.patient.id);

        if (!deleted) {
          wx.showToast({
            title: "删除失败，未找到病人",
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

  onOpenRecord(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/medical-record-detail/index?id=${id}`,
    });
  },

});
