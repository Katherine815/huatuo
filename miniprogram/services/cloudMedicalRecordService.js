const { getOptionLabelMap, medicalRecordFormSections } = require("../config/medicalRecordForm");

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

function getCloudEnv() {
  const app = getApp();

  return app.globalData && app.globalData.env ? app.globalData.env : "";
}

function isCloudMode() {
  return Boolean(getCloudEnv());
}

function callMedicalRecordApi(type, data = {}) {
  return wx.cloud
    .callFunction({
      name: "medicalRecordApi",
      data: {
        type,
        ...data,
      },
    })
    .then((response) => {
      const result = response.result || {};

      if (!result.success) {
        throw new Error(result.message || "云端请求失败");
      }

      return result;
    });
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
            .map((id) => {
              return optionLabelMap[group.key] && optionLabelMap[group.key][id];
            })
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

function hydrateMedicalRecord(record) {
  if (!record) {
    return record;
  }

  return {
    ...record,
    detailSections: buildDetailSections(record),
  };
}

function listPatients(keyword) {
  return callMedicalRecordApi("listPatients", {
    keyword,
  });
}

function getPatientById(id) {
  return callMedicalRecordApi("getPatient", {
    id,
  }).then((result) => {
    return result.patient;
  });
}

function getPatientByIdIncludingDeleted(id) {
  return callMedicalRecordApi("getPatientIncludingDeleted", {
    id,
  }).then((result) => {
    return result.patient;
  });
}

function createPatient(patient) {
  return callMedicalRecordApi("createPatient", {
    patient,
  }).then((result) => {
    return result.patient;
  });
}

function updatePatient(id, patient) {
  return callMedicalRecordApi("updatePatient", {
    id,
    patient,
  }).then((result) => {
    return result.patient;
  });
}

function deletePatient(id) {
  return callMedicalRecordApi("deletePatient", {
    id,
  });
}

function getRecordsByPatientId(patientId) {
  return callMedicalRecordApi("listPatientRecords", {
    patientId,
  }).then((result) => {
    return result.records || [];
  });
}

function getRecordById(id) {
  return callMedicalRecordApi("getMedicalRecord", {
    id,
  }).then((result) => {
    return hydrateMedicalRecord(result.record);
  });
}

function getTrashRecordById(id) {
  return callMedicalRecordApi("getTrashMedicalRecord", {
    id,
  }).then((result) => {
    return hydrateMedicalRecord(result.record);
  });
}

function createMedicalRecord(patientId, record) {
  return callMedicalRecordApi("createMedicalRecord", {
    patientId,
    record,
  }).then((result) => {
    return hydrateMedicalRecord(result.record);
  });
}

function updateMedicalRecord(id, record) {
  return callMedicalRecordApi("updateMedicalRecord", {
    id,
    record,
  }).then((result) => {
    return hydrateMedicalRecord(result.record);
  });
}

function deleteMedicalRecord(id) {
  return callMedicalRecordApi("deleteMedicalRecord", {
    id,
  });
}

function getRecycleBinGroups() {
  return callMedicalRecordApi("listRecycleBinGroups").then((result) => {
    return result.groups || [];
  });
}

function getDeletedRecordsByPatientId(patientId) {
  return callMedicalRecordApi("listDeletedRecordsByPatient", {
    patientId,
  }).then((result) => {
    return {
      patient: result.patient || null,
      records: (result.records || []).map(hydrateMedicalRecord),
    };
  });
}

function restoreMedicalRecord(id) {
  return callMedicalRecordApi("restoreMedicalRecord", {
    id,
  });
}

function permanentlyDeleteMedicalRecord(id) {
  return callMedicalRecordApi("permanentlyDeleteMedicalRecord", {
    id,
  });
}

function restorePatientRecycleRecords(patientId) {
  return callMedicalRecordApi("restorePatientRecycleRecords", {
    patientId,
  });
}

function permanentlyDeletePatientRecycleRecords(patientId) {
  return callMedicalRecordApi("permanentlyDeletePatientRecycleRecords", {
    patientId,
  });
}

function exportMedicalRecords(data) {
  return callMedicalRecordApi("exportMedicalRecords", data);
}

function importMedicalRecords(payload, importMode) {
  return callMedicalRecordApi("importMedicalRecords", {
    payload,
    importMode,
  });
}

module.exports = {
  createMedicalRecord,
  createPatient,
  deleteMedicalRecord,
  deletePatient,
  exportMedicalRecords,
  getDeletedRecordsByPatientId,
  getPatientById,
  getPatientByIdIncludingDeleted,
  getRecycleBinGroups,
  getRecordById,
  getRecordsByPatientId,
  getTrashRecordById,
  importMedicalRecords,
  isCloudMode,
  listPatients,
  permanentlyDeleteMedicalRecord,
  permanentlyDeletePatientRecycleRecords,
  restoreMedicalRecord,
  restorePatientRecycleRecords,
  updateMedicalRecord,
  updatePatient,
};
