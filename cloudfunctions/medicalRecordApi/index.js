const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

const exportSections = [
  { key: "chiefComplaint", title: "主诉", type: "textarea" },
  {
    key: "inspection",
    title: "望诊内容",
    groups: [
      { key: "spirit", label: "精神", options: { 101: "困乏", 102: "躁动", 103: "正常" } },
      { key: "bodyShape", label: "形体", options: { 111: "胖", 112: "瘦", 113: "强", 114: "中", 115: "弱", 116: "标准" } },
      { key: "complexion", label: "面色", options: { 121: "黄", 122: "白", 123: "青", 124: "红", 125: "黑", 126: "斑点" } },
      { key: "lips", label: "口唇", options: { 131: "唇红", 132: "唇淡" } },
      { key: "eyesEars", label: "耳目", type: "textarea" },
      { key: "hair", label: "头发", options: { 141: "干枯", 142: "白发", 143: "出油" } },
      { key: "noseThroat", label: "鼻喉", type: "textarea" },
      { key: "skin", label: "皮肤", type: "textarea" },
    ],
  },
  {
    key: "auscultationOlfaction",
    title: "闻诊内容",
    groups: [
      { key: "odor", label: "气味", options: { 201: "口气", 202: "汗气", 203: "痰涕", 204: "大小便", 205: "下身之气" } },
      { key: "voiceSounds", label: "声音", options: { 211: "高低", 212: "鼻鼾", 213: "喷嚏" } },
      { key: "speech", label: "语言", options: { 221: "独语", 222: "诳语", 223: "错语", 224: "梦语" } },
      { key: "breathing", label: "呼吸", options: { 231: "咳", 232: "喘", 233: "气促" } },
      { key: "gastrointestinalSounds", label: "胃肠音", options: { 241: "呕吐", 242: "嗳气", 243: "打嗝", 244: "肠鸣" } },
    ],
  },
  {
    key: "tongueDiagnosis",
    title: "舌诊内容",
    groups: [
      { key: "tongueBody", label: "舌质", options: { 301: "淡红舌", 302: "淡白色", 303: "红舌", 304: "青紫舌", 305: "老嫩", 306: "胖瘦", 307: "瘦白", 308: "点刺", 309: "齿痕", 310: "裂纹舌" } },
      { key: "tongueMovement", label: "舌动态", options: { 321: "痿软", 322: "强硬", 323: "歪斜", 324: "颤动", 325: "吐弄" } },
      { key: "coatingTexture", label: "苔质", options: { 331: "厚苔", 332: "薄苔", 333: "润苔", 334: "燥苔", 335: "腻苔", 336: "腐苔", 337: "剥落苔", 338: "全苔", 339: "偏苔" } },
      { key: "coatingColor", label: "苔色", options: { 351: "白苔", 352: "黄苔", 353: "灰黑苔", 354: "淡黄", 355: "焦黄", 356: "黄腻苔", 357: "白腻苔" } },
    ],
  },
  {
    key: "pulseDiagnosis",
    title: "切脉诊内容",
    groups: [
      { key: "pulsePositions", label: "部位", options: { 401: "左寸上头面", 402: "寸心", 403: "关肝", 404: "尺肾阴", 405: "尺下（生殖）", 406: "右寸上头面", 407: "寸肺", 408: "关脾", 409: "尺肾阳", 410: "尺下（生殖）" } },
      { key: "pulseQualities", label: "脉象", options: { 421: "浮沉", 422: "快慢", 423: "大小", 424: "凹凸", 425: "高低", 426: "左右", 427: "强弱", 428: "软硬" } },
      { key: "pulseNotes", label: "备注", type: "textarea" },
    ],
  },
  {
    key: "inquiry",
    title: "问诊内容",
    groups: [
      { key: "coldHeat", label: "寒热", options: { 501: "发热恶寒", 502: "不怕寒热", 503: "怕风", 504: "怕热", 505: "怕冷", 506: "怕热怕冷" } },
      { key: "sweating", label: "汗", options: { 511: "出汗", 512: "汗多", 513: "汗少", 514: "盗汗", 515: "手足汗", 516: "头腹汗" } },
      { key: "pain", label: "疼痛", options: { 521: "偏正头疼", 522: "胸", 523: "腹", 524: "肋", 525: "腰", 526: "背", 527: "四肢", 528: "全身" } },
      { key: "headBodyDiscomfort", label: "头身不适", options: { 531: "头晕目眩", 532: "心慌", 533: "胸闷", 534: "腰胀肋胀", 535: "身重", 536: "麻木", 537: "耳鸣", 538: "目痛目痒", 539: "红眼" } },
      { key: "sleep", label: "睡眠", options: { 541: "失眠易醒", 542: "入睡困难", 543: "多梦" } },
      { key: "appetiteDiet", label: "饮食", options: { 551: "偏食", 552: "厌食", 553: "旺盛", 554: "正常" } },
      { key: "drinking", label: "饮水", options: { 561: "喜热", 562: "喜凉", 563: "渴饮", 564: "不渴饮", 565: "正常" } },
      { key: "taste", label: "口味", options: { 571: "臭味", 572: "甜味", 573: "酸味", 574: "苦味", 575: "涩味", 576: "咸腥味" } },
      { key: "phlegmNasalDischarge", label: "痰涕", options: { 581: "色黄", 582: "色白", 583: "厚", 584: "稀", 585: "易咳出", 586: "不易咳出" } },
      { key: "stool", label: "大便", options: { 591: "便秘", 592: "羊屎", 593: "泄", 594: "鸭屎", 595: "排便不爽", 596: "便粘", 597: "便血", 598: "完谷不化", 599: "里急后重" } },
      { key: "urination", label: "小便", options: { 601: "量少", 602: "量多", 603: "尿黄", 604: "刺痛", 605: "遗尿", 606: "淋漓不净" } },
      { key: "menstruationLeukorrheaPregnancyPostpartum", label: "经带产", options: { 611: "月经量多", 612: "或少", 613: "提前", 614: "拖延", 615: "崩漏", 616: "闭经", 617: "痛经", 618: "血块", 619: "暗紫", 620: "白带", 621: "多稀", 622: "黄带", 623: "有气味" } },
      { key: "sexualFunction", label: "性功能", options: { 631: "早泄", 632: "阳痿", 633: "性冷淡", 634: "不孕不育" } },
      { key: "inquiryNotes", label: "备注", type: "textarea" },
    ],
  },
  { key: "fourDiagnosisSynthesisPatternDifferentiation", title: "四诊合参辩证分析", type: "textarea" },
  { key: "treatmentPlan", title: "治疗方案", type: "textarea" },
  { key: "prescriptionMedication", title: "处方用药", type: "textarea" },
  { key: "generalNotes", title: "备注", type: "textarea" },
];

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

function sanitizeFileName(name) {
  return String(name || "export")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

function buildReadableSections(record) {
  return exportSections
    .map((section) => {
      if (section.type === "textarea") {
        const text = String(record[section.key] || "").trim();

        return text ? { title: section.title, text } : null;
      }

      const items = section.groups
        .map((group) => {
          if (group.type === "textarea") {
            const note = record.notes && record.notes[group.key] ? String(record.notes[group.key]).trim() : "";

            return note ? { label: group.label, value: note } : null;
          }

          const selectedIds = record.selected && record.selected[group.key] ? record.selected[group.key] : [];
          const labels = selectedIds
            .map((id) => {
              return group.options && group.options[id];
            })
            .filter(Boolean);

          return labels.length ? { label: group.label, value: labels.join("、") } : null;
        })
        .filter(Boolean);

      return items.length ? { title: section.title, items } : null;
    })
    .filter(Boolean);
}

function buildExportRecord(record) {
  return {
    ...record,
    readableSections: buildReadableSections(record),
  };
}

async function getExportPayload(event) {
  let patient = null;
  let records = [];

  if (event.recordId) {
    const recordResult = await getMedicalRecord({
      id: event.recordId,
    });

    if (!recordResult.success) {
      return recordResult;
    }

    const patientResult = await getPatient({
      id: recordResult.record.patientId,
    });

    if (!patientResult.success) {
      return patientResult;
    }

    patient = patientResult.patient;
    records = [recordResult.record];
  } else if (event.patientId) {
    const patientResult = await getPatient({
      id: event.patientId,
    });

    if (!patientResult.success) {
      return patientResult;
    }

    const recordsResult = await listPatientRecords({
      patientId: event.patientId,
    });

    patient = patientResult.patient;
    records = recordsResult.records || [];
  } else {
    return {
      success: false,
      message: "缺少导出对象",
    };
  }

  if (!records.length) {
    return {
      success: false,
      message: "暂无可导出的医疗记录",
    };
  }

  return {
    success: true,
    exportedAt: formatDateTime(new Date()),
    patient,
    records: records.map(buildExportRecord),
  };
}

function buildJsonBuffer(payload) {
  return Buffer.from(JSON.stringify(payload, null, 2), "utf8");
}

function createPdfLine(text, options = {}) {
  return {
    text: String(text || ""),
    fontSize: options.fontSize || 11,
    leading: options.leading || 16,
  };
}

function wrapText(line, maxLength) {
  const lines = [];
  const lineConfig = typeof line === "string" ? createPdfLine(line) : line;
  const normalizedText = String(lineConfig.text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  normalizedText.split("\n").forEach((paragraph) => {
    if (!paragraph) {
      lines.push({
        ...lineConfig,
        text: "",
      });
      return;
    }

    let remaining = paragraph;

    while (remaining.length > maxLength) {
      lines.push({
        ...lineConfig,
        text: remaining.slice(0, maxLength),
      });
      remaining = remaining.slice(maxLength);
    }

    lines.push({
      ...lineConfig,
      text: remaining,
    });
  });

  return lines;
}

function textToPdfHex(text) {
  return Buffer.from(String(text), "utf16le").swap16().toString("hex").toUpperCase();
}

function pdfObject(id, body) {
  return `${id} 0 obj\n${body}\nendobj\n`;
}

function buildPdfContentStream(lines) {
  const commands = ["BT", "50 790 Td"];

  lines.forEach((line, index) => {
    if (index > 0) {
      commands.push("T*");
    }

    commands.push(`/F1 ${line.fontSize} Tf`);
    commands.push(`${line.leading} TL`);
    commands.push(`<${textToPdfHex(line.text)}> Tj`);
  });

  commands.push("ET");
  return commands.join("\n");
}

function buildPdfBuffer(lines) {
  const pageLines = [];
  const pages = [];

  lines.forEach((line) => {
    const lineConfig = typeof line === "string" ? createPdfLine(line) : line;
    const maxLength = lineConfig.fontSize > 11 ? 24 : 38;

    wrapText(lineConfig, maxLength).forEach((wrappedLine) => {
      pageLines.push(wrappedLine);

      if (pageLines.length >= 46) {
        pages.push(pageLines.splice(0, pageLines.length));
      }
    });
  });

  if (pageLines.length) {
    pages.push(pageLines);
  }

  const objects = [];
  const pageObjectIds = [];
  const catalogId = 1;
  const pagesId = 2;
  const fontId = 3;
  const cidFontId = 4;
  let nextObjectId = 5;

  objects.push(pdfObject(catalogId, "<< /Type /Catalog /Pages 2 0 R >>"));
  objects.push(pdfObject(pagesId, "<< /Type /Pages /Kids [] /Count 0 >>"));
  objects.push(pdfObject(fontId, "<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [4 0 R] >>"));
  objects.push(pdfObject(cidFontId, "<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> /DW 1000 >>"));

  pages.forEach((page) => {
    const content = buildPdfContentStream(page);
    const contentId = nextObjectId;
    const pageId = nextObjectId + 1;

    nextObjectId += 2;
    pageObjectIds.push(pageId);
    objects.push(pdfObject(contentId, `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`));
    objects.push(pdfObject(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`));
  });

  objects[1] = pdfObject(pagesId, `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`);

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += object;
  });

  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "binary");
}

function buildPdfLines(payload) {
  const lines = [
    createPdfLine("中医医案记录导出", { fontSize: 17, leading: 24 }),
    createPdfLine(`导出时间：${payload.exportedAt}`),
    createPdfLine(""),
    createPdfLine("病人固定信息"),
    createPdfLine(`病人编号：${payload.patient.patientNo || ""}`),
    createPdfLine(`姓名：${payload.patient.name || ""}`),
    createPdfLine(`性别：${payload.patient.gender || ""}`),
    createPdfLine(`出生年月：${payload.patient.birthDate || ""}`),
    createPdfLine(`联系：${payload.patient.contact || ""}`),
  ];

  payload.records.forEach((record) => {
    lines.push(createPdfLine(""));
    lines.push(createPdfLine("--------------------------------------------------"));
    lines.push(createPdfLine(`医疗记录编号：${record.recordNo || ""}`));
    lines.push(createPdfLine(`就诊日期：${record.visitDate || ""}`));
    lines.push(createPdfLine(`更新时间：${record.updatedAt || ""}`));

    record.readableSections.forEach((section, index) => {
      lines.push(createPdfLine(""));
      lines.push(createPdfLine(`(${index + 1})${section.title}`));

      if (section.text) {
        lines.push(createPdfLine(section.text));
      }

      (section.items || []).forEach((item) => {
        lines.push(createPdfLine(`${item.label}：${item.value}`));
      });
    });
  });

  return lines;
}

async function exportMedicalRecords(event) {
  const payload = await getExportPayload(event);

  if (!payload.success) {
    return payload;
  }

  const format = event.format === "pdf" ? "pdf" : "json";
  const isSingleRecord = Boolean(event.recordId);
  const fileBaseName = sanitizeFileName(isSingleRecord
    ? `${payload.patient.name}_${payload.records[0].recordNo}`
    : `${payload.patient.name}_全部医疗记录`);
  const fileName = `${fileBaseName}.${format}`;
  const fileContent = format === "pdf" ? buildPdfBuffer(buildPdfLines(payload)) : buildJsonBuffer(payload);
  const uploadResult = await cloud.uploadFile({
    cloudPath: `exports/${payload.patient.id}/${Date.now()}_${fileName}`,
    fileContent,
  });

  return {
    success: true,
    fileID: uploadResult.fileID,
    fileName,
    format,
  };
}

function validateImportPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "JSON 格式不正确";
  }

  if (!payload.patient || !Array.isArray(payload.records)) {
    return "不是本系统导出的 JSON 文件";
  }

  const patientMessage = validatePatientPayload(payload.patient);

  if (patientMessage) {
    return `病人信息不完整：${patientMessage}`;
  }

  if (!payload.records.length) {
    return "JSON 中没有医疗记录";
  }

  for (let i = 0; i < payload.records.length; i++) {
    const message = validateMedicalRecordPayload(payload.records[i]);

    if (message) {
      return `第 ${i + 1} 条医疗记录不完整：${message}`;
    }
  }

  return "";
}

function normalizeImportRecord(record) {
  return {
    visitDate: String(record.visitDate || "").trim(),
    chiefComplaint: String(record.chiefComplaint || "").trim(),
    selected: record.selected || {},
    notes: record.notes || {},
    fourDiagnosisSynthesisPatternDifferentiation: record.fourDiagnosisSynthesisPatternDifferentiation || "",
    treatmentPlan: record.treatmentPlan || "",
    prescriptionMedication: record.prescriptionMedication || "",
    generalNotes: record.generalNotes || "",
  };
}

function normalizeImportPatient(patient) {
  return {
    patientNo: generatePatientNo(),
    name: String(patient.name || "").trim(),
    gender: String(patient.gender || "").trim(),
    birthDate: String(patient.birthDate || "").trim(),
    contact: String(patient.contact || "").trim(),
  };
}

function buildRecordImportSignature(record) {
  const normalizedRecord = normalizeImportRecord(record);

  return JSON.stringify({
    visitDate: normalizedRecord.visitDate,
    chiefComplaint: normalizedRecord.chiefComplaint,
    selected: normalizedRecord.selected,
    notes: normalizedRecord.notes,
    fourDiagnosisSynthesisPatternDifferentiation: normalizedRecord.fourDiagnosisSynthesisPatternDifferentiation,
    treatmentPlan: normalizedRecord.treatmentPlan,
    prescriptionMedication: normalizedRecord.prescriptionMedication,
    generalNotes: normalizedRecord.generalNotes,
  });
}

async function findMatchingPatient(patient) {
  const normalizedPatient = normalizeImportPatient(patient);
  const result = await db
    .collection("patients")
    .where({
      name: normalizedPatient.name,
      gender: normalizedPatient.gender,
      birthDate: normalizedPatient.birthDate,
      contact: normalizedPatient.contact,
      deletedAt: "",
    })
    .limit(1)
    .get();

  return result.data.length ? normalizePatient(result.data[0]) : null;
}

async function createImportedPatient(patient, now) {
  const patientData = {
    ...normalizeImportPatient(patient),
    importedAt: now,
    importedFrom: "json",
    createdAt: now,
    updatedAt: now,
    deletedAt: "",
  };
  const addedPatient = await db.collection("patients").add({
    data: patientData,
  });

  return normalizePatient({
    _id: addedPatient._id,
    ...patientData,
  });
}

async function getExistingRecordSignatures(patientId) {
  const result = await db
    .collection("medical_records")
    .where({
      patientId,
      deletedAt: "",
    })
    .limit(100)
    .get();
  const signatures = {};

  result.data.forEach((record) => {
    signatures[buildRecordImportSignature(record)] = true;
    signatures[`id:${record._id}`] = true;

    if (record.recordNo) {
      signatures[`no:${record.recordNo}`] = true;
    }

    if (record.importedSourceRecordId) {
      signatures[`id:${record.importedSourceRecordId}`] = true;
    }

    if (record.importedSourceRecordNo) {
      signatures[`no:${record.importedSourceRecordNo}`] = true;
    }
  });

  return signatures;
}

async function importMedicalRecords(event) {
  const payload = event.payload || {};
  const importMode = event.importMode === "merge" ? "merge" : "create";
  const validationMessage = validateImportPayload(payload);

  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
    };
  }

  const now = formatDateTime(new Date());
  let patient = null;
  let createdPatient = false;

  if (importMode === "merge") {
    patient = await findMatchingPatient(payload.patient);
  }

  if (!patient) {
    patient = await createImportedPatient(payload.patient, now);
    createdPatient = true;
  }

  const patientId = patient.id;
  const existingSignatures = importMode === "merge" && !createdPatient ? await getExistingRecordSignatures(patientId) : {};
  const importedRecords = [];
  let skippedRecordCount = 0;

  for (let i = 0; i < payload.records.length; i++) {
    const sourceRecordPayload = payload.records[i];
    const sourceRecord = normalizeImportRecord(sourceRecordPayload);
    const signature = buildRecordImportSignature(sourceRecordPayload);
    const sourceIdSignature = sourceRecordPayload.id ? `id:${sourceRecordPayload.id}` : "";
    const sourceNoSignature = sourceRecordPayload.recordNo ? `no:${sourceRecordPayload.recordNo}` : "";

    if (existingSignatures[signature] || existingSignatures[sourceIdSignature] || existingSignatures[sourceNoSignature]) {
      skippedRecordCount += 1;
      continue;
    }

    const recordData = {
      ...sourceRecord,
      recordNo: generateMedicalRecordNo(),
      patientId,
      importedAt: now,
      importedFrom: "json",
      importedSourceRecordId: sourceRecordPayload.id || "",
      importedSourceRecordNo: sourceRecordPayload.recordNo || "",
      createdAt: now,
      updatedAt: now,
      deletedAt: "",
    };
    const addedRecord = await db.collection("medical_records").add({
      data: recordData,
    });

    importedRecords.push(normalizeMedicalRecord({
      _id: addedRecord._id,
      ...recordData,
    }));
    existingSignatures[signature] = true;

    if (sourceIdSignature) {
      existingSignatures[sourceIdSignature] = true;
    }

    if (sourceNoSignature) {
      existingSignatures[sourceNoSignature] = true;
    }
  }

  return {
    success: true,
    patient,
    importMode,
    createdPatient,
    importedPatientCount: createdPatient ? 1 : 0,
    importedRecordCount: importedRecords.length,
    skippedRecordCount,
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
    case "exportMedicalRecords":
      return await exportMedicalRecords(event);
    case "importMedicalRecords":
      return await importMedicalRecords(event);
    default:
      return {
        success: false,
        authorized: false,
        status: "unknown_action",
        message: `Unknown action: ${event.type}`,
      };
  }
};
