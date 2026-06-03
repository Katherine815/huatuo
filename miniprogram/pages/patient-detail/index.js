const { deletePatient, getPatientById, getRecordsByPatientId } = require("../../utils/mockData");

Page({
  data: {
    patientId: "",
    patient: null,
    allRecords: [],
    records: [],
    hasRecords: false,
    hasAnyRecords: false,
    hasFilteredOutRecords: false,
    selectedVisitDate: "",
    dateFilterLabel: "按日期筛选",
    hasDateFilter: false,
    dateFilterButtonClass: "date-filter-button",
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
    const patient = getPatientById(this.data.patientId);

    if (!patient) {
      wx.showToast({
        title: "未找到病人",
        icon: "none",
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 800);
      return;
    }

    const allRecords = getRecordsByPatientId(patient.id);
    const records = this.filterRecordsByDate(allRecords, this.data.selectedVisitDate);

    this.setData({
      patient,
      allRecords,
      records,
      hasRecords: records.length > 0,
      hasAnyRecords: allRecords.length > 0,
      hasFilteredOutRecords: allRecords.length > 0 && records.length === 0,
    });
  },

  filterRecordsByDate(records, selectedDate) {
    if (!selectedDate) {
      return records;
    }

    return records.filter((record) => {
      return record.visitDate === selectedDate;
    });
  },

  onCreateRecord() {
    wx.navigateTo({
      url: `/pages/medical-record-edit/index?patientId=${this.data.patient.id}`,
    });
  },

  onEditPatient() {
    wx.navigateTo({
      url: `/pages/patient-edit/index?id=${this.data.patient.id}`,
    });
  },

  onDeletePatient() {
    wx.showModal({
      title: "删除病人",
      content: "删除后该病人和名下医疗记录将从列表隐藏。本地原型会软删除，后续可做回收站。",
      confirmText: "删除",
      confirmColor: "#b42318",
      success: (result) => {
        if (!result.confirm) {
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

  onOpenDateFilter() {
    if (this.data.hasDateFilter) {
      this.applyDateFilter("");
      return;
    }

    wx.navigateTo({
      url: `/pages/record-date-filter/index?patientId=${this.data.patient.id}`,
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
    const records = this.filterRecordsByDate(this.data.allRecords, date);

    this.setData({
      selectedVisitDate: date,
      dateFilterLabel: date ? `筛选${date}` : "按日期筛选",
      hasDateFilter: Boolean(date),
      dateFilterButtonClass: date ? "date-filter-button active" : "date-filter-button",
      records,
      hasRecords: records.length > 0,
      hasFilteredOutRecords: this.data.allRecords.length > 0 && records.length === 0,
    });
  },
});
