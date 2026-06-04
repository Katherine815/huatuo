const { getRecordById } = require("../utils/mockData");

function pad(value) {
  return String(value).padStart(2, "0");
}

function nowText() {
  const now = new Date();

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("-") + " " + [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join(":");
}

function normalizeRecords(records) {
  return records.map((record) => {
    return record.detailSections ? record : getRecordById(record.id);
  }).filter(Boolean);
}

function buildPatientLines(patient) {
  return [
    `病人编号：${patient.patientNo || ""}`,
    `姓名：${patient.name || ""}`,
    `性别：${patient.gender || ""}`,
    `出生年月：${patient.birthDate || ""}`,
    `联系：${patient.contact || ""}`,
  ];
}

function buildRecordLines(record) {
  const lines = [
    "",
    "----------------------------------------",
    `医疗记录编号：${record.recordNo || ""}`,
    `就诊日期：${record.visitDate || ""}`,
    `更新时间：${record.updatedAt || ""}`,
  ];

  (record.detailSections || []).forEach((section) => {
    lines.push("");
    lines.push(`${section.title}`);

    if (section.text) {
      lines.push(String(section.text));
    }

    (section.items || []).forEach((item) => {
      lines.push(`${item.label}：${item.value}`);
    });
  });

  return lines;
}

function buildTextExport(patient, records) {
  const hydratedRecords = normalizeRecords(records);
  const lines = [
    "中医医案记录导出",
    `导出时间：${nowText()}`,
    "",
    "病人固定信息",
    ...buildPatientLines(patient),
  ];

  hydratedRecords.forEach((record) => {
    lines.push(...buildRecordLines(record));
  });

  return lines.join("\n");
}

function copyTextExport(patient, records) {
  if (!records.length) {
    wx.showToast({
      title: "暂无可导出的医疗记录",
      icon: "none",
    });
    return;
  }

  wx.setClipboardData({
    data: buildTextExport(patient, records),
    success() {
      wx.showToast({
        title: "已复制",
        icon: "success",
      });
    },
  });
}

function exportSingleMedicalRecord(patient, record) {
  copyTextExport(patient, [record]);
}

function exportPatientMedicalRecords(patient, records) {
  copyTextExport(patient, records);
}

module.exports = {
  exportPatientMedicalRecords,
  exportSingleMedicalRecord,
};
