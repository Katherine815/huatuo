const { TEXT_LIMIT, medicalRecordFormSections } = require("../../config/medicalRecordForm");
const {
  createMedicalRecord,
  getPatientById,
  getRecordById,
  updateMedicalRecord,
} = require("../../utils/mockData");

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

Page({
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
      title: "缺少病人或医疗记录",
      icon: "none",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 800);
  },

  loadEditMode(recordId) {
    const record = getRecordById(recordId);

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

    const draft = createEmptyDraft(record);
    const patient = getPatientById(record.patientId);

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
    const patient = getPatientById(patientId);

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

    const today = new Date();
    const visitDate = `${today.getFullYear()}-${padTwo(today.getMonth() + 1)}-${padTwo(today.getDate())}`;
    const draft = createEmptyDraft();
    draft.visitDate = visitDate;

    this.setData({
      mode: "create",
      modeLabel: "Create Prototype",
      pageTitle: `${patient.name} · 新增医疗记录`,
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
      const record = createMedicalRecord(this.data.patient.id, draft);

      if (!record) {
        wx.showToast({
          title: "保存失败，未找到病人",
          icon: "none",
        });
        return;
      }

      wx.showToast({
        title: "已新增医疗记录",
        icon: "success",
      });

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/medical-record-detail/index?id=${record.id}`,
        });
      }, 500);
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
});
