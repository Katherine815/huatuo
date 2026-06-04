const {
  deleteMedicalRecord,
  getPatientById,
  getPatientByIdIncludingDeleted,
  getRecordById,
  getTrashRecordById,
  permanentlyDeleteTrashItem,
  restoreTrashItem,
} = require("../../utils/mockData");
const { exportSingleMedicalRecord } = require("../../services/exportService");

Page({
  data: {
    recordId: "",
    isTrash: false,
    patient: null,
    record: null,
  },

  onLoad(options) {
    this.setData({
      recordId: options.id || "",
      isTrash: options.trash === "1",
    });

    this.refreshPage();
  },

  onShow() {
    if (this.data.recordId) {
      this.refreshPage();
    }
  },

  refreshPage() {
    const record = this.data.isTrash ? getTrashRecordById(this.data.recordId) : getRecordById(this.data.recordId);

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
      patient: this.data.isTrash ? getPatientByIdIncludingDeleted(record.patientId) : getPatientById(record.patientId),
    });
  },

  onEditRecord() {
    wx.navigateTo({
      url: `/pages/medical-record-edit/index?id=${this.data.record.id}`,
    });
  },

  onExportRecord() {
    exportSingleMedicalRecord(this.data.patient, this.data.record);
  },

  onDeleteRecord() {
    wx.showModal({
      title: "删除医疗记录",
      content: "删除后该医疗记录会移入回收站，可在 30 天内恢复。",
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

  onRestoreRecord() {
    const restored = restoreTrashItem("medicalRecord", this.data.record.id);

    wx.showToast({
      title: restored ? "已恢复" : "恢复失败",
      icon: restored ? "success" : "none",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  },

  onPermanentDeleteRecord() {
    wx.showModal({
      title: "永久删除",
      content: "永久删除后无法从回收站恢复，请确认。",
      confirmText: "永久删除",
      confirmColor: "#b42318",
      success: (result) => {
        if (!result.confirm) {
          return;
        }

        const deleted = permanentlyDeleteTrashItem("medicalRecord", this.data.record.id);

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
