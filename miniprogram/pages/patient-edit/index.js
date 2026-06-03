const { createPatient, getPatientById, updatePatient } = require("../../utils/mockData");

function createDraft(patient) {
  return {
    name: patient && patient.name ? patient.name : "",
    gender: patient && patient.gender ? patient.gender : "",
    birthDate: patient && patient.birthDate ? patient.birthDate : "",
    contact: patient && patient.contact ? patient.contact : "",
  };
}

Page({
  data: {
    mode: "create",
    modeLabel: "Create Patient",
    pageTitle: "新增病人",
    patientNo: "保存后生成编号",
    patient: null,
    draft: createDraft(),
    genderDisplay: "请选择性别",
    birthDateDisplay: "请选择出生年月",
    genderOptions: ["男", "女", "其他"],
    genderIndex: -1,
    canRender: true,
  },

  onLoad(options) {
    if (options.id) {
      this.loadEditMode(options.id);
    }
  },

  loadEditMode(patientId) {
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

    const draft = createDraft(patient);

    this.setData({
      mode: "edit",
      modeLabel: "Edit Patient",
      pageTitle: patient.name,
      patientNo: patient.patientNo,
      patient,
      draft,
      genderDisplay: draft.gender || "请选择性别",
      birthDateDisplay: draft.birthDate || "请选择出生年月",
      genderIndex: this.getGenderIndex(draft.gender),
    });
  },

  onInput(event) {
    const { field } = event.currentTarget.dataset;
    const draft = { ...this.data.draft };

    draft[field] = event.detail.value;

    this.setData({ draft });
  },

  onGenderChange(event) {
    const genderIndex = Number(event.detail.value);
    const draft = { ...this.data.draft };

    draft.gender = this.data.genderOptions[genderIndex];

    this.setData({
      draft,
      genderDisplay: draft.gender || "请选择性别",
      genderIndex,
    });
  },

  onBirthDateChange(event) {
    const draft = { ...this.data.draft };

    draft.birthDate = event.detail.value;

    this.setData({
      draft,
      birthDateDisplay: draft.birthDate || "请选择出生年月",
    });
  },

  onSaveDraft() {
    const draft = this.data.draft;
    const requiredFields = [
      { key: "name", label: "姓名" },
      { key: "gender", label: "性别" },
      { key: "birthDate", label: "出生年月" },
      { key: "contact", label: "联系" },
    ];

    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];

      if (!String(draft[field.key] || "").trim()) {
        wx.showToast({
          title: `请填写${field.label}`,
          icon: "none",
        });
        return;
      }
    }

    if (this.data.mode === "create") {
      const patient = createPatient(draft);

      wx.showToast({
        title: "已新增病人",
        icon: "success",
      });

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/patient-detail/index?id=${patient.id}`,
        });
      }, 500);
      return;
    }

    const updatedPatient = updatePatient(this.data.patient.id, draft);

    if (!updatedPatient) {
      wx.showToast({
        title: "保存失败，未找到病人",
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

  getGenderIndex(gender) {
    return this.data.genderOptions.indexOf(gender);
  },
});
