const { TEXT_LIMIT, medicalRecordFormSections } = require("../../config/medicalRecordForm");
const {
  createMedicalRecord,
  getPatientById,
  getRecordById,
  updateMedicalRecord,
} = require("../../utils/mockData");
const cloudMedicalRecordService = require("../../services/cloudMedicalRecordService");

function createEmptyDraft(record) {
  return {
    visitDate: record && record.visitDate ? record.visitDate : "",
    chiefComplaint: record && record.chiefComplaint ? record.chiefComplaint : "",
    fourDiagnosisSynthesisPatternDifferentiation: record && record.fourDiagnosisSynthesisPatternDifferentiation ? record.fourDiagnosisSynthesisPatternDifferentiation : "",
    treatmentPlan: record && record.treatmentPlan ? record.treatmentPlan : "",
    prescriptionMedication: record && record.prescriptionMedication ? record.prescriptionMedication : "",
    generalNotes: record && record.generalNotes ? record.generalNotes : "",
    selected: record && record.selected ? { ...record.selected } : {},
    notes: record && record.notes ? { ...record.notes } : {},
  };
}

function buildViewSections(draft) {
  return medicalRecordFormSections.map((section) => {
    const viewSection = {
      ...section,
      isTextarea: section.type === "textarea",
      textValue: section.type === "textarea" ? draft[section.key] || "" : "",
      textLength: section.type === "textarea" ? String(draft[section.key] || "").length : 0,
    };

    if (section.groups) {
      viewSection.groups = section.groups.map((group) => {
        const selectedIds = draft.selected[group.key] || [];

        return {
          ...group,
          isTextarea: group.type === "textarea",
          textValue: group.type === "textarea" ? draft.notes[group.key] || "" : "",
          textLength: group.type === "textarea" ? String(draft.notes[group.key] || "").length : 0,
          options: group.options
            ? group.options.map((option) => {
                return {
                  ...option,
                  checked: selectedIds.indexOf(option.id) >= 0,
                };
              })
            : undefined,
        };
      });
    }

    return viewSection;
  });
}

function padTwo(value) {
  const text = String(value);
  return text.length >= 2 ? text : `0${text}`;
}

module.exports = {
  data: {
    mode: "edit",
    modeLabel: "Edit Prototype",
    pageTitle: "",
    subtitle: "",
    patient: null,
    record: null,
    canRender: false,
    sections: buildViewSections(createEmptyDraft()),
    textLimit: TEXT_LIMIT,
    draft: createEmptyDraft(),
  },

  onLoad(options) {
    if (options.id) {
      this.loadEditMode(options.id);
      return;
    }

    if (options.patientId) {
      this.loadCreateMode(options.patientId);
      return;
    }

    wx.showToast({
      title: "缺少病人或就诊记录",
      icon: "none",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 800);
  },

  loadEditMode(recordId) {
    if (cloudMedicalRecordService.isCloudMode()) {
      cloudMedicalRecordService
        .getRecordById(recordId)
        .then((record) => {
          return Promise.all([
            Promise.resolve(record),
            cloudMedicalRecordService.getPatientById(record.patientId),
          ]);
        })
        .then(([record, patient]) => {
          this.applyEditMode(record, patient);
        })
        .catch(() => {
          this.handleMissingRecord();
        });
      return;
    }

    const record = getRecordById(recordId);

    if (!record) {
      this.handleMissingRecord();
      return;
    }

    const patient = getPatientById(record.patientId);

    this.applyEditMode(record, patient);
  },

  applyEditMode(record, patient) {
    const draft = createEmptyDraft(record);

    wx.setNavigationBarTitle({
      title: "编辑就诊记录",
    });

    this.setData({
      mode: "edit",
      modeLabel: "Edit Prototype",
      pageTitle: patient.name,
      subtitle: record.recordNo,
      record,
      patient,
      draft,
      sections: buildViewSections(draft),
      canRender: true,
    });
  },

  loadCreateMode(patientId) {
    if (cloudMedicalRecordService.isCloudMode()) {
      cloudMedicalRecordService
        .getPatientById(patientId)
        .then((patient) => {
          this.applyCreateMode(patient);
        })
        .catch(() => {
          this.handleMissingPatient();
        });
      return;
    }

    const patient = getPatientById(patientId);

    if (!patient) {
      this.handleMissingPatient();
      return;
    }

    this.applyCreateMode(patient);
  },

  applyCreateMode(patient) {
    const today = new Date();
    const visitDate = `${today.getFullYear()}-${padTwo(today.getMonth() + 1)}-${padTwo(today.getDate())}`;
    const draft = createEmptyDraft();
    draft.visitDate = visitDate;

    wx.setNavigationBarTitle({
      title: "新增就诊记录",
    });

    this.setData({
      mode: "create",
      modeLabel: "Create Prototype",
      pageTitle: patient.name,
      subtitle: "保存后生成编号",
      record: {
        id: "",
        patientId: patient.id,
        visitDate,
        recordNo: "保存后生成编号",
      },
      patient,
      draft,
      sections: buildViewSections(draft),
      canRender: true,
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

  handleMissingRecord() {
    wx.showToast({
      title: "未找到就诊记录",
      icon: "none",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 800);
  },

  onTextInput(event) {
    const { key, group } = event.currentTarget.dataset;
    const value = event.detail.value;
    const draft = {
      ...this.data.draft,
      selected: { ...this.data.draft.selected },
      notes: { ...this.data.draft.notes },
    };

    if (group) {
      draft.notes[group] = value;
    } else {
      draft[key] = value;
    }

    this.setData({
      draft,
      sections: buildViewSections(draft),
    });
  },

  onVisitDateChange(event) {
    const draft = {
      ...this.data.draft,
      selected: { ...this.data.draft.selected },
      notes: { ...this.data.draft.notes },
    };

    draft.visitDate = event.detail.value;

    this.setData({ draft });
  },

  onCheckboxChange(event) {
    const { group } = event.currentTarget.dataset;
    const draft = {
      ...this.data.draft,
      selected: { ...this.data.draft.selected },
      notes: { ...this.data.draft.notes },
    };

    draft.selected[group] = event.detail.value.map((value) => Number(value));

    this.setData({ draft });
  },

  onSaveDraft() {
    const draft = this.data.draft;

    if (!String(draft.visitDate || "").trim()) {
      wx.showToast({
        title: "请选择就诊日期",
        icon: "none",
      });
      return;
    }

    if (!String(draft.chiefComplaint || "").trim()) {
      wx.showToast({
        title: "请填写主诉",
        icon: "none",
      });
      return;
    }

    if (this.data.mode === "create") {
      if (cloudMedicalRecordService.isCloudMode()) {
        cloudMedicalRecordService
          .createMedicalRecord(this.data.patient.id, draft)
          .then((record) => {
            wx.showToast({
              title: "已新增就诊记录",
              icon: "success",
            });

            setTimeout(() => {
              wx.redirectTo({
                url: `/pages/medical-record-detail/index?id=${record.id}`,
              });
            }, 500);
          })
          .catch((error) => {
            wx.showToast({
              title: error.message || "保存失败",
              icon: "none",
            });
          });
        return;
      }

      const record = createMedicalRecord(this.data.patient.id, draft);

      if (!record) {
        wx.showToast({
          title: "保存失败，未找到病人",
          icon: "none",
        });
        return;
      }

      wx.showToast({
        title: "已新增就诊记录",
        icon: "success",
      });

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/medical-record-detail/index?id=${record.id}`,
        });
      }, 500);
      return;
    }

    if (cloudMedicalRecordService.isCloudMode()) {
      cloudMedicalRecordService
        .updateMedicalRecord(this.data.record.id, draft)
        .then(() => {
          wx.showToast({
            title: "已保存",
            icon: "success",
          });

          setTimeout(() => {
            wx.navigateBack();
          }, 500);
        })
        .catch((error) => {
          wx.showToast({
            title: error.message || "保存失败",
            icon: "none",
          });
        });
      return;
    }

    const updatedRecord = updateMedicalRecord(this.data.record.id, draft);

    if (!updatedRecord) {
      wx.showToast({
        title: "保存失败，未找到记录",
        icon: "none",
      });
      return;
    }

    wx.showToast({
      title: "已保存",
      icon: "success",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  },
};
