const { getOptionLabelMap, medicalRecordFormSections } = require("../config/medicalRecordForm");

const STORAGE_KEY = "huatuo_local_data_v1";

const initialPatients = [
  {
    id: "pat_202605300001",
    patientNo: "P202605300001",
    name: "张明",
    gender: "男",
    birthDate: "1982-04",
    contact: "13800000001",
    createdAt: "2026-05-30 09:00",
    updatedAt: "2026-05-30 09:00",
  },
  {
    id: "pat_202605300002",
    patientNo: "P202605300002",
    name: "李芳",
    gender: "女",
    birthDate: "1991-11",
    contact: "微信：lifang-tcm",
    createdAt: "2026-05-30 09:20",
    updatedAt: "2026-05-30 09:20",
  },
  {
    id: "pat_202605300003",
    patientNo: "P202605300003",
    name: "王建国",
    gender: "男",
    birthDate: "1975-08",
    contact: "家属电话 13900000003",
    createdAt: "2026-05-30 10:10",
    updatedAt: "2026-05-30 10:10",
  },
];

const medicalRecordSectionOrder = [
  "chiefComplaint",
  "inspection",
  "auscultationOlfaction",
  "tongueDiagnosis",
  "pulseDiagnosis",
  "inquiry",
  "fourDiagnosisSynthesisPatternDifferentiation",
  "treatmentPlan",
  "prescriptionMedication",
  "generalNotes",
];

const initialMedicalRecords = [
  {
    id: "rec_202602140001",
    recordNo: "R202602140001",
    patientId: "pat_202605300001",
    visitDate: "2026-02-14",
    chiefComplaint: "反复失眠，易醒，多梦。",
    selected: {
      spirit: [101],
      bodyShape: [112, 114],
      complexion: [122, 126],
      voiceSounds: [212, 213],
      speech: [224],
      breathing: [233],
      coldHeat: [505],
      sleep: [541, 543],
      drinking: [561],
      urination: [601, 603],
      tongueBody: [302, 309],
      coatingTexture: [332, 333],
      coatingColor: [351],
      pulsePositions: [402, 403, 404],
      pulseQualities: [421, 427, 428],
    },
    notes: {
      eyesEars: "目涩，久视后加重。",
      pulseNotes: "左关偏弱，尺部沉取较明显。",
    },
    fourDiagnosisSynthesisPatternDifferentiation: "睡眠不安，兼见困乏、舌淡、尺部沉，先按气血不足兼肾气不足方向观察。",
    treatmentPlan: "调和气血，安神助眠，兼顾下焦。",
    prescriptionMedication: "此处为原型示例文本，后续支持最多 5000 汉字输入。",
    generalNotes: "建议记录睡眠时长、夜醒次数、饮水和二便变化。",
    updatedAt: "2026-02-14 15:35",
  },
  {
    id: "rec_202604050001",
    recordNo: "R202604050001",
    patientId: "pat_202605300001",
    visitDate: "2026-04-05",
    chiefComplaint: "睡眠较前改善，仍有胸闷。",
    selected: {
      headBodyDiscomfort: [532, 533],
      sleep: [543],
      appetiteDiet: [554],
      pulsePositions: [402, 403],
      pulseQualities: [422, 426],
    },
    notes: {},
    fourDiagnosisSynthesisPatternDifferentiation: "前症减轻，胸闷仍在，需继续观察情志、睡眠与脉象变化。",
    treatmentPlan: "延续前法，酌加理气宽胸方向。",
    prescriptionMedication: "原型占位。",
    generalNotes: "复诊时对比夜醒次数。",
    updatedAt: "2026-04-05 16:10",
  },
  {
    id: "rec_202603210001",
    recordNo: "R202603210001",
    patientId: "pat_202605300002",
    visitDate: "2026-03-21",
    chiefComplaint: "月经拖延，伴小腹冷痛。",
    selected: {
      coldHeat: [505],
      drinking: [561],
      menstruationLeukorrheaPregnancyPostpartum: [614, 617, 619],
      tongueBody: [304, 306],
      coatingTexture: [331],
    },
    notes: {},
    fourDiagnosisSynthesisPatternDifferentiation: "经期拖延，小腹冷痛，血色偏暗，先考虑寒凝血行不畅。",
    treatmentPlan: "温经散寒，调理冲任。",
    prescriptionMedication: "原型占位。",
    generalNotes: "下次记录周期天数和疼痛程度。",
    updatedAt: "2026-03-21 11:12",
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canUseStorage() {
  return typeof wx !== "undefined" && wx.getStorageSync && wx.setStorageSync;
}

function createInitialState() {
  return {
    patients: clone(initialPatients),
    medicalRecords: clone(initialMedicalRecords),
  };
}

function loadState() {
  if (!canUseStorage()) {
    return createInitialState();
  }

  const storedState = wx.getStorageSync(STORAGE_KEY);

  if (storedState && storedState.patients && storedState.medicalRecords) {
    return storedState;
  }

  const initialState = createInitialState();
  wx.setStorageSync(STORAGE_KEY, initialState);
  return initialState;
}

function saveState(state) {
  if (canUseStorage()) {
    wx.setStorageSync(STORAGE_KEY, state);
  }
}

function formatDateTime(date) {
  const pad = (value) => {
    const text = String(value);
    return text.length >= 2 ? text : `0${text}`;
  };

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function generatePatientId() {
  return `pat_${Date.now()}`;
}

function generatePatientNo() {
  const date = new Date();
  const pad = (value) => {
    const text = String(value);
    return text.length >= 2 ? text : `0${text}`;
  };

  return `P${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${String(Date.now()).slice(-4)}`;
}

function generateMedicalRecordId() {
  return `rec_${Date.now()}`;
}

function generateMedicalRecordNo() {
  const date = new Date();
  const pad = (value) => {
    const text = String(value);
    return text.length >= 2 ? text : `0${text}`;
  };

  return `R${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${String(Date.now()).slice(-4)}`;
}

function getPatients() {
  return loadState().patients.filter((patient) => !patient.deletedAt);
}

function getMedicalRecordCount() {
  return loadState().medicalRecords.filter((record) => !record.deletedAt).length;
}

function getPatientById(id) {
  return loadState().patients.find((patient) => patient.id === id && !patient.deletedAt);
}

function searchPatients(keyword) {
  const normalizedKeyword = String(keyword || "").trim().toLowerCase();

  const patients = getPatients();

  if (!normalizedKeyword) {
    return patients;
  }

  return patients.filter((patient) => {
    return [patient.name, patient.contact, patient.patientNo].some((value) => {
      return String(value || "").toLowerCase().includes(normalizedKeyword);
    });
  });
}

function getRecordsByPatientId(patientId) {
  return loadState()
    .medicalRecords
    .filter((record) => record.patientId === patientId && !record.deletedAt)
    .sort((a, b) => {
      return new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
    });
}

function getRecordById(id) {
  const record = loadState().medicalRecords.find((item) => item.id === id && !item.deletedAt);

  if (!record) {
    return record;
  }

  return {
    ...record,
    detailSections: buildDetailSections(record),
  };
}

function createPatient(data) {
  const state = loadState();
  const now = formatDateTime(new Date());
  const patient = {
    id: generatePatientId(),
    patientNo: generatePatientNo(),
    name: data.name,
    gender: data.gender,
    birthDate: data.birthDate,
    contact: data.contact,
    createdAt: now,
    updatedAt: now,
  };

  state.patients.unshift(patient);
  saveState(state);

  return patient;
}

function updatePatient(id, data) {
  const state = loadState();
  const patientIndex = state.patients.findIndex((patient) => patient.id === id);

  if (patientIndex < 0) {
    return null;
  }

  const updatedPatient = {
    ...state.patients[patientIndex],
    name: data.name,
    gender: data.gender,
    birthDate: data.birthDate,
    contact: data.contact,
    updatedAt: formatDateTime(new Date()),
  };

  state.patients.splice(patientIndex, 1, updatedPatient);
  saveState(state);

  return updatedPatient;
}

function deletePatient(id) {
  const state = loadState();
  const patientIndex = state.patients.findIndex((patient) => patient.id === id && !patient.deletedAt);

  if (patientIndex < 0) {
    return false;
  }

  const deletedAt = formatDateTime(new Date());

  state.patients.splice(patientIndex, 1, {
    ...state.patients[patientIndex],
    deletedAt,
    updatedAt: deletedAt,
  });

  state.medicalRecords = state.medicalRecords.map((record) => {
    if (record.patientId !== id || record.deletedAt) {
      return record;
    }

    return {
      ...record,
      deletedAt,
      updatedAt: deletedAt,
    };
  });

  saveState(state);

  return true;
}

function createMedicalRecord(patientId, data) {
  const state = loadState();
  const patient = state.patients.find((item) => item.id === patientId);

  if (!patient) {
    return null;
  }

  const now = formatDateTime(new Date());
  const record = {
    id: generateMedicalRecordId(),
    recordNo: generateMedicalRecordNo(),
    patientId,
    visitDate: data.visitDate,
    chiefComplaint: data.chiefComplaint,
    selected: data.selected || {},
    notes: data.notes || {},
    fourDiagnosisSynthesisPatternDifferentiation: data.fourDiagnosisSynthesisPatternDifferentiation || "",
    treatmentPlan: data.treatmentPlan || "",
    prescriptionMedication: data.prescriptionMedication || "",
    generalNotes: data.generalNotes || "",
    createdAt: now,
    updatedAt: now,
  };

  state.medicalRecords.push(record);
  saveState(state);

  return getRecordById(record.id);
}

function updateMedicalRecord(id, data) {
  const state = loadState();
  const recordIndex = state.medicalRecords.findIndex((record) => record.id === id);

  if (recordIndex < 0) {
    return null;
  }

  const updatedRecord = {
    ...state.medicalRecords[recordIndex],
    visitDate: data.visitDate,
    chiefComplaint: data.chiefComplaint,
    selected: data.selected || {},
    notes: data.notes || {},
    fourDiagnosisSynthesisPatternDifferentiation: data.fourDiagnosisSynthesisPatternDifferentiation || "",
    treatmentPlan: data.treatmentPlan || "",
    prescriptionMedication: data.prescriptionMedication || "",
    generalNotes: data.generalNotes || "",
    updatedAt: formatDateTime(new Date()),
  };

  state.medicalRecords.splice(recordIndex, 1, updatedRecord);
  saveState(state);

  return getRecordById(id);
}

function deleteMedicalRecord(id) {
  const state = loadState();
  const recordIndex = state.medicalRecords.findIndex((record) => record.id === id && !record.deletedAt);

  if (recordIndex < 0) {
    return false;
  }

  const deletedAt = formatDateTime(new Date());

  state.medicalRecords.splice(recordIndex, 1, {
    ...state.medicalRecords[recordIndex],
    deletedAt,
    updatedAt: deletedAt,
  });

  saveState(state);

  return true;
}

function buildDetailSections(record) {
  const optionLabelMap = getOptionLabelMap();

  return medicalRecordFormSections
    .map((section) => {
      if (section.type === "textarea") {
        const text = record[section.key] || "";

        if (!text) {
          return null;
        }

        return {
          key: section.key,
          title: section.title,
          englishTitle: section.englishTitle,
          text,
        };
      }

      const items = section.groups
        .map((group) => {
          if (group.type === "textarea") {
            const note = record.notes && record.notes[group.key];

            return note ? { label: group.label, value: note } : null;
          }

          const selectedIds = record.selected && record.selected[group.key] ? record.selected[group.key] : [];
          const labels = selectedIds
            .map((id) => optionLabelMap[group.key] && optionLabelMap[group.key][id])
            .filter(Boolean);

          return labels.length ? { label: group.label, value: labels.join("、") } : null;
        })
        .filter(Boolean);

      if (!items.length) {
        return null;
      }

      return {
        key: section.key,
        title: section.title,
        englishTitle: section.englishTitle,
        items,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      return medicalRecordSectionOrder.indexOf(a.key) - medicalRecordSectionOrder.indexOf(b.key);
    });
}

module.exports = {
  createMedicalRecord,
  createPatient,
  deleteMedicalRecord,
  deletePatient,
  getRecordById,
  getMedicalRecordCount,
  getPatients,
  getPatientById,
  getRecordsByPatientId,
  searchPatients,
  updateMedicalRecord,
  updatePatient,
};
