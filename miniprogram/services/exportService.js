const { getRecordById } = require("../utils/mockData");
const cloudMedicalRecordService = require("./cloudMedicalRecordService");

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

function getTempDownloadUrl(exportResult) {
  return new Promise((resolve) => {
    wx.cloud.getTempFileURL({
      fileList: [exportResult.fileID],
      success(response) {
        const firstFile = (response.fileList || [])[0];
        resolve(firstFile && firstFile.tempFileURL ? firstFile.tempFileURL : "");
      },
      fail() {
        resolve("");
      },
    });
  });
}

function openPdfExportFile(exportResult) {
  wx.showLoading({
    title: "正在下载",
    mask: true,
  });

  wx.cloud.downloadFile({
    fileID: exportResult.fileID,
    success(response) {
      wx.hideLoading();

      wx.openDocument({
        filePath: response.tempFilePath,
        fileType: "pdf",
        showMenu: true,
        fail() {
          wx.showToast({
            title: "PDF 已生成，打开失败",
            icon: "none",
          });
        },
      });
    },
    fail() {
      wx.hideLoading();
      wx.showToast({
        title: "下载失败",
        icon: "none",
      });
    },
  });
}

function showJsonDownloadLink(exportResult) {
  wx.showLoading({
    title: "正在生成链接",
    mask: true,
  });

  getTempDownloadUrl(exportResult).then((tempDownloadUrl) => {
    wx.hideLoading();

    if (!tempDownloadUrl) {
      wx.showToast({
        title: "生成链接失败",
        icon: "none",
      });
      return;
    }

    wx.setClipboardData({
      data: tempDownloadUrl,
      success() {
        wx.showModal({
          title: "JSON 下载链接",
          content: `临时下载链接已复制到剪贴板。\n\n文件名：${exportResult.fileName}\n\n链接：${tempDownloadUrl}`,
          showCancel: false,
        });
      },
      fail() {
        wx.showModal({
          title: "JSON 下载链接",
          content: `文件名：${exportResult.fileName}\n\n链接：${tempDownloadUrl}`,
          showCancel: false,
        });
      },
    });
  });
}

function runCloudExport(data) {
  wx.showActionSheet({
    itemList: ["导出 PDF 文件", "导出 JSON 文件"],
    success(result) {
      const format = result.tapIndex === 0 ? "pdf" : "json";

      wx.showLoading({
        title: "正在生成",
        mask: true,
      });

      cloudMedicalRecordService
        .exportMedicalRecords({
          ...data,
          format,
        })
        .then((exportResult) => {
          wx.hideLoading();

          if (format === "pdf") {
            openPdfExportFile(exportResult);
            return;
          }

          showJsonDownloadLink(exportResult);
        })
        .catch((error) => {
          wx.hideLoading();
          wx.showToast({
            title: error.message || "导出失败",
            icon: "none",
          });
        });
    },
  });
}

function exportSingleMedicalRecord(patient, record) {
  if (cloudMedicalRecordService.isCloudMode()) {
    runCloudExport({
      recordId: record.id,
    });
    return;
  }

  copyTextExport(patient, [record]);
}

function exportPatientMedicalRecords(patient, records) {
  if (cloudMedicalRecordService.isCloudMode()) {
    runCloudExport({
      patientId: patient.id,
    });
    return;
  }

  copyTextExport(patient, records);
}

module.exports = {
  exportPatientMedicalRecords,
  exportSingleMedicalRecord,
};
