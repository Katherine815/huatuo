const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date) {
  const beijingDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);

  return [
    beijingDate.getUTCFullYear(),
    pad(beijingDate.getUTCMonth() + 1),
    pad(beijingDate.getUTCDate()),
  ].join("-") + " " + [
    pad(beijingDate.getUTCHours()),
    pad(beijingDate.getUTCMinutes()),
  ].join(":");
}

function generatePatientNo() {
  const date = new Date(Date.now() + 8 * 60 * 60 * 1000);

  return `P${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${String(Date.now()).slice(-4)}`;
}

function generateMedicalRecordNo() {
  const date = new Date(Date.now() + 8 * 60 * 60 * 1000);

  return `R${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${String(Date.now()).slice(-4)}`;
}

function normalizePatient(patient) {
  if (!patient) {
    return null;
  }

  return {
    id: patient._id,
    patientNo: patient.patientNo || "",
    name: patient.name || "",
    gender: patient.gender || "",
    birthDate: patient.birthDate || "",
    contact: patient.contact || "",
    createdAt: patient.createdAt || "",
    updatedAt: patient.updatedAt || "",
    deletedAt: patient.deletedAt || "",
  };
}

function normalizeMedicalRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record._id,
    recordNo: record.recordNo || "",
    patientId: record.patientId || "",
    visitDate: record.visitDate || "",
    chiefComplaint: record.chiefComplaint || "",
    selected: record.selected || {},
    notes: record.notes || {},
    fourDiagnosisSynthesisPatternDifferentiation: record.fourDiagnosisSynthesisPatternDifferentiation || "",
    treatmentPlan: record.treatmentPlan || "",
    prescriptionMedication: record.prescriptionMedication || "",
    generalNotes: record.generalNotes || "",
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
    deletedAt: record.deletedAt || "",
    deletedByPatientId: record.deletedByPatientId || "",
  };
}

async function findAuthorizedUser(openid) {
  const result = await db
    .collection("authorized_users")
    .where({
      openid,
      active: true,
    })
    .limit(1)
    .get();

  return result.data && result.data.length ? result.data[0] : null;
}

async function authCheck() {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const user = await findAuthorizedUser(openid);

    if (!user) {
      return {
        success: true,
        authorized: false,
        status: "unauthorized",
        openid,
        message: "当前微信账号不在医案系统白名单中。",
      };
    }

    return {
      success: true,
      authorized: true,
      status: "authorized",
      openid,
      user: {
        name: user.name || "",
        role: user.role || "doctor",
      },
    };
  } catch (error) {
    return {
      success: false,
      authorized: false,
      status: "not_configured",
      openid,
      message: "请先创建 authorized_users 集合并添加管理员或医生 OpenID。",
      errorMessage: error.message,
    };
  }
}

async function requireAuthorizedUser() {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const user = await findAuthorizedUser(openid);

  if (!user) {
    return {
      authorized: false,
      openid,
      response: {
        success: false,
        authorized: false,
        status: "unauthorized",
        openid,
        message: "当前微信账号不在医案系统白名单中。",
      },
    };
  }

  return {
    authorized: true,
    openid,
    user,
  };
}

function validatePatientPayload(data) {
  const requiredFields = [
    { key: "name", label: "姓名" },
    { key: "gender", label: "性别" },
    { key: "birthDate", label: "出生年月" },
    { key: "contact", label: "联系" },
  ];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];

    if (!String(data[field.key] || "").trim()) {
      return `请填写${field.label}`;
    }
  }

  return "";
}

function validateMedicalRecordPayload(data) {
  if (!String(data.visitDate || "").trim()) {
    return "请选择就诊日期";
  }

  if (!String(data.chiefComplaint || "").trim()) {
    return "请填写主诉";
  }

  return "";
}

async function listPatients(event) {
  const keyword = String(event.keyword || "").trim().toLowerCase();
  const patientResult = await db
    .collection("patients")
    .where({
      deletedAt: "",
    })
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  const patients = patientResult.data.map(normalizePatient).filter((patient) => {
    if (!keyword) {
      return true;
    }

    return [patient.name, patient.contact, patient.patientNo].some((value) => {
      return String(value || "").toLowerCase().includes(keyword);
    });
  });
  const recordCount = await db
    .collection("medical_records")
    .where({
      deletedAt: "",
    })
    .count();

  return {
    success: true,
    patients,
    totalPatientCount: patientResult.data.length,
    totalMedicalRecordCount: recordCount.total,
  };
}

async function getPatient(event) {
  const result = await db
    .collection("patients")
    .doc(event.id)
    .get();
  const patient = normalizePatient(result.data);

  if (!patient || patient.deletedAt) {
    return {
      success: false,
      message: "未找到病人",
    };
  }

  return {
    success: true,
    patient,
  };
}

async function getPatientIncludingDeleted(event) {
  const result = await db
    .collection("patients")
    .doc(event.id)
    .get();
  const patient = normalizePatient(result.data);

  if (!patient) {
    return {
      success: false,
      message: "未找到病人",
    };
  }

  return {
    success: true,
    patient,
  };
}

async function createPatient(event) {
  const data = event.patient || {};
  const validationMessage = validatePatientPayload(data);

  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
    };
  }

  const now = formatDateTime(new Date());
  const patientData = {
    patientNo: generatePatientNo(),
    name: String(data.name || "").trim(),
    gender: String(data.gender || "").trim(),
    birthDate: String(data.birthDate || "").trim(),
    contact: String(data.contact || "").trim(),
    createdAt: now,
    updatedAt: now,
    deletedAt: "",
  };
  const added = await db.collection("patients").add({
    data: patientData,
  });

  return {
    success: true,
    patient: normalizePatient({
      _id: added._id,
      ...patientData,
    }),
  };
}

async function updatePatient(event) {
  const data = event.patient || {};
  const validationMessage = validatePatientPayload(data);

  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
    };
  }

  const now = formatDateTime(new Date());
  const updateData = {
    name: String(data.name || "").trim(),
    gender: String(data.gender || "").trim(),
    birthDate: String(data.birthDate || "").trim(),
    contact: String(data.contact || "").trim(),
    updatedAt: now,
  };

  await db
    .collection("patients")
    .doc(event.id)
    .update({
      data: updateData,
    });

  return await getPatient({
    id: event.id,
  });
}

async function deletePatient(event) {
  const now = formatDateTime(new Date());

  await db
    .collection("patients")
    .doc(event.id)
    .update({
      data: {
        deletedAt: now,
        updatedAt: now,
      },
    });

  await db
    .collection("medical_records")
    .where({
      patientId: event.id,
      deletedAt: "",
    })
    .update({
      data: {
        deletedAt: now,
        deletedByPatientId: event.id,
        updatedAt: now,
      },
    });

  return {
    success: true,
  };
}

async function listPatientRecords(event) {
  const result = await db
    .collection("medical_records")
    .where({
      patientId: event.patientId,
      deletedAt: "",
    })
    .orderBy("visitDate", "asc")
    .limit(100)
    .get();

  return {
    success: true,
    records: result.data.map(normalizeMedicalRecord),
  };
}

async function getMedicalRecord(event) {
  const result = await db
    .collection("medical_records")
    .doc(event.id)
    .get();
  const record = normalizeMedicalRecord(result.data);

  if (!record || record.deletedAt) {
    return {
      success: false,
      message: "未找到医疗记录",
    };
  }

  return {
    success: true,
    record,
  };
}

async function getTrashMedicalRecord(event) {
  const result = await db
    .collection("medical_records")
    .doc(event.id)
    .get();
  const record = normalizeMedicalRecord(result.data);

  if (!record || !record.deletedAt) {
    return {
      success: false,
      message: "未找到回收站医疗记录",
    };
  }

  return {
    success: true,
    record,
  };
}

async function createMedicalRecord(event) {
  const patientResult = await getPatient({
    id: event.patientId,
  });

  if (!patientResult.success) {
    return {
      success: false,
      message: "保存失败，未找到病人",
    };
  }

  const data = event.record || {};
  const validationMessage = validateMedicalRecordPayload(data);

  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
    };
  }

  const now = formatDateTime(new Date());
  const recordData = {
    recordNo: generateMedicalRecordNo(),
    patientId: event.patientId,
    visitDate: String(data.visitDate || "").trim(),
    chiefComplaint: String(data.chiefComplaint || "").trim(),
    selected: data.selected || {},
    notes: data.notes || {},
    fourDiagnosisSynthesisPatternDifferentiation: data.fourDiagnosisSynthesisPatternDifferentiation || "",
    treatmentPlan: data.treatmentPlan || "",
    prescriptionMedication: data.prescriptionMedication || "",
    generalNotes: data.generalNotes || "",
    createdAt: now,
    updatedAt: now,
    deletedAt: "",
  };
  const added = await db.collection("medical_records").add({
    data: recordData,
  });

  return {
    success: true,
    record: normalizeMedicalRecord({
      _id: added._id,
      ...recordData,
    }),
  };
}

async function updateMedicalRecord(event) {
  const data = event.record || {};
  const validationMessage = validateMedicalRecordPayload(data);

  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
    };
  }

  const now = formatDateTime(new Date());
  const updateData = {
    visitDate: String(data.visitDate || "").trim(),
    chiefComplaint: String(data.chiefComplaint || "").trim(),
    selected: data.selected || {},
    notes: data.notes || {},
    fourDiagnosisSynthesisPatternDifferentiation: data.fourDiagnosisSynthesisPatternDifferentiation || "",
    treatmentPlan: data.treatmentPlan || "",
    prescriptionMedication: data.prescriptionMedication || "",
    generalNotes: data.generalNotes || "",
    updatedAt: now,
  };

  await db
    .collection("medical_records")
    .doc(event.id)
    .update({
      data: updateData,
    });

  return await getMedicalRecord({
    id: event.id,
  });
}

async function deleteMedicalRecord(event) {
  const now = formatDateTime(new Date());

  await db
    .collection("medical_records")
    .doc(event.id)
    .update({
      data: {
        deletedAt: now,
        updatedAt: now,
      },
    });

  return {
    success: true,
  };
}

async function listRecycleBinGroups() {
  const patientResult = await db
    .collection("patients")
    .where({
      deletedAt: db.command.neq(""),
    })
    .limit(100)
    .get();
  const recordResult = await db
    .collection("medical_records")
    .where({
      deletedAt: db.command.neq(""),
    })
    .limit(100)
    .get();
  const patients = patientResult.data.map(normalizePatient);
  const records = recordResult.data.map(normalizeMedicalRecord);
  const recordPatientIds = records
    .map((record) => record.patientId)
    .filter((patientId, index, patientIds) => {
      return patientId && patientIds.indexOf(patientId) === index;
    });

  if (recordPatientIds.length) {
    const recordPatientResult = await db
      .collection("patients")
      .where({
        _id: db.command.in(recordPatientIds),
      })
      .limit(100)
      .get();

    recordPatientResult.data.forEach((patient) => {
      if (!patients.some((item) => item.id === patient._id)) {
        patients.push(normalizePatient(patient));
      }
    });
  }

  const patientMap = {};
  const patientIds = [];

  patients.forEach((patient) => {
    patientMap[patient.id] = patient;

    if (patientIds.indexOf(patient.id) < 0) {
      patientIds.push(patient.id);
    }
  });

  records.forEach((record) => {
    if (patientIds.indexOf(record.patientId) < 0) {
      patientIds.push(record.patientId);
    }
  });

  const groups = patientIds
    .map((patientId) => {
      const patient = patientMap[patientId] || null;
      const patientRecords = records.filter((record) => {
        return record.patientId === patientId;
      });
      const latestDeletedAt = [patient && patient.deletedAt]
        .concat(patientRecords.map((record) => record.deletedAt))
        .filter(Boolean)
        .sort()
        .pop();

      if (!patient && !patientRecords.length) {
        return null;
      }

      return {
        patientId,
        patientName: patient ? patient.name : "未知病人",
        patientNo: patient ? patient.patientNo : "",
        title: `${patient ? patient.name : "未知病人"}的医疗记录`,
        recordCount: patientRecords.length,
        isPatientDeleted: Boolean(patient && patient.deletedAt),
        latestDeletedAt,
        detail: patient && patient.deletedAt ? "病人已删除，相关医疗记录在回收站中" : `包含 ${patientRecords.length} 条已删除医疗记录`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      return String(b.latestDeletedAt || "").localeCompare(String(a.latestDeletedAt || ""));
    });

  return {
    success: true,
    groups,
  };
}

async function listDeletedRecordsByPatient(event) {
  const patientResult = await getPatientIncludingDeleted({
    id: event.patientId,
  });
  const recordResult = await db
    .collection("medical_records")
    .where({
      patientId: event.patientId,
      deletedAt: db.command.neq(""),
    })
    .orderBy("visitDate", "asc")
    .limit(100)
    .get();

  return {
    success: true,
    patient: patientResult.success ? patientResult.patient : null,
    records: recordResult.data.map(normalizeMedicalRecord),
  };
}

async function restoreMedicalRecord(event) {
  const now = formatDateTime(new Date());
  const recordResult = await getTrashMedicalRecord({
    id: event.id,
  });

  if (!recordResult.success) {
    return recordResult;
  }

  await db
    .collection("medical_records")
    .doc(event.id)
    .update({
      data: {
        deletedAt: "",
        deletedByPatientId: "",
        updatedAt: now,
      },
    });

  const patientResult = await getPatientIncludingDeleted({
    id: recordResult.record.patientId,
  });

  if (patientResult.success && patientResult.patient.deletedAt) {
    await db
      .collection("patients")
      .doc(recordResult.record.patientId)
      .update({
        data: {
          deletedAt: "",
          updatedAt: now,
        },
      });
  }

  return {
    success: true,
  };
}

async function permanentlyDeleteMedicalRecord(event) {
  await db
    .collection("medical_records")
    .doc(event.id)
    .remove();

  return {
    success: true,
  };
}

async function restorePatientRecycleRecords(event) {
  const now = formatDateTime(new Date());

  try {
    const patientResult = await getPatientIncludingDeleted({
      id: event.patientId,
    });

    if (patientResult.success && patientResult.patient.deletedAt) {
      await db
        .collection("patients")
        .doc(event.patientId)
        .update({
          data: {
            deletedAt: "",
            updatedAt: now,
          },
        });
    }
  } catch (error) {
    // Patient may have already been permanently deleted; restoring records still matters.
  }

  await db
    .collection("medical_records")
    .where({
      patientId: event.patientId,
      deletedAt: db.command.neq(""),
    })
    .update({
      data: {
        deletedAt: "",
        deletedByPatientId: "",
        updatedAt: now,
      },
    });

  return {
    success: true,
  };
}

async function permanentlyDeletePatientRecycleRecords(event) {
  const patientResult = await getPatientIncludingDeleted({
    id: event.patientId,
  });

  if (patientResult.success && patientResult.patient.deletedAt) {
    await db
      .collection("medical_records")
      .where({
        patientId: event.patientId,
      })
      .remove();

    await db
      .collection("patients")
      .doc(event.patientId)
      .remove();

    return {
      success: true,
    };
  }

  await db
    .collection("medical_records")
    .where({
      patientId: event.patientId,
      deletedAt: db.command.neq(""),
    })
    .remove();

  return {
    success: true,
  };
}

exports.main = async (event) => {
  if (event.type !== "authCheck") {
    const auth = await requireAuthorizedUser();

    if (!auth.authorized) {
      return auth.response;
    }
  }

  switch (event.type) {
    case "authCheck":
      return await authCheck();
    case "listPatients":
      return await listPatients(event);
    case "getPatient":
      return await getPatient(event);
    case "getPatientIncludingDeleted":
      return await getPatientIncludingDeleted(event);
    case "createPatient":
      return await createPatient(event);
    case "updatePatient":
      return await updatePatient(event);
    case "deletePatient":
      return await deletePatient(event);
    case "listPatientRecords":
      return await listPatientRecords(event);
    case "getMedicalRecord":
      return await getMedicalRecord(event);
    case "getTrashMedicalRecord":
      return await getTrashMedicalRecord(event);
    case "createMedicalRecord":
      return await createMedicalRecord(event);
    case "updateMedicalRecord":
      return await updateMedicalRecord(event);
    case "deleteMedicalRecord":
      return await deleteMedicalRecord(event);
    case "listRecycleBinGroups":
      return await listRecycleBinGroups(event);
    case "listDeletedRecordsByPatient":
      return await listDeletedRecordsByPatient(event);
    case "restoreMedicalRecord":
      return await restoreMedicalRecord(event);
    case "permanentlyDeleteMedicalRecord":
      return await permanentlyDeleteMedicalRecord(event);
    case "restorePatientRecycleRecords":
      return await restorePatientRecycleRecords(event);
    case "permanentlyDeletePatientRecycleRecords":
      return await permanentlyDeletePatientRecycleRecords(event);
    default:
      return {
        success: false,
        authorized: false,
        status: "unknown_action",
        message: `Unknown action: ${event.type}`,
      };
  }
};
