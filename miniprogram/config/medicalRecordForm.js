const TEXT_LIMIT = 5000;

const medicalRecordFormSections = [
  {
    key: "chiefComplaint",
    title: "主诉",
    englishTitle: "Chief Complaint",
    type: "textarea",
  },
  {
    key: "inspection",
    title: "望诊内容",
    englishTitle: "Inspection",
    groups: [
      { key: "spirit", label: "精神", options: [{ id: 101, label: "困乏" }, { id: 102, label: "躁动" }, { id: 103, label: "正常" }] },
      { key: "bodyShape", label: "形体", options: [{ id: 111, label: "胖" }, { id: 112, label: "瘦" }, { id: 113, label: "强" }, { id: 114, label: "中" }, { id: 115, label: "弱" }, { id: 116, label: "标准" }] },
      { key: "complexion", label: "面色", options: [{ id: 121, label: "黄" }, { id: 122, label: "白" }, { id: 123, label: "青" }, { id: 124, label: "红" }, { id: 125, label: "黑" }, { id: 126, label: "斑点" }] },
      { key: "lips", label: "口唇", options: [{ id: 131, label: "唇红" }, { id: 132, label: "唇淡" }] },
      { key: "eyesEars", label: "耳目", type: "textarea" },
      { key: "hair", label: "头发", options: [{ id: 141, label: "干枯" }, { id: 142, label: "白发" }, { id: 143, label: "出油" }] },
      { key: "noseThroat", label: "鼻喉", type: "textarea" },
      { key: "skin", label: "皮肤", type: "textarea" },
    ],
  },
  {
    key: "auscultationOlfaction",
    title: "闻诊内容",
    englishTitle: "Auscultation and Olfaction",
    groups: [
      { key: "odor", label: "气味", options: [{ id: 201, label: "口气" }, { id: 202, label: "汗气" }, { id: 203, label: "痰涕" }, { id: 204, label: "大小便" }, { id: 205, label: "下身之气" }] },
      { key: "voiceSounds", label: "声音", options: [{ id: 211, label: "高低" }, { id: 212, label: "鼻鼾" }, { id: 213, label: "喷嚏" }] },
      { key: "speech", label: "语言", options: [{ id: 221, label: "独语" }, { id: 222, label: "诳语" }, { id: 223, label: "错语" }, { id: 224, label: "梦语" }] },
      { key: "breathing", label: "呼吸", options: [{ id: 231, label: "咳" }, { id: 232, label: "喘" }, { id: 233, label: "气促" }] },
      { key: "gastrointestinalSounds", label: "胃肠音", options: [{ id: 241, label: "呕吐" }, { id: 242, label: "嗳气" }, { id: 243, label: "打嗝" }, { id: 244, label: "肠鸣" }] },
    ],
  },
  {
    key: "tongueDiagnosis",
    title: "舌诊内容",
    englishTitle: "Tongue Diagnosis",
    groups: [
      { key: "tongueBody", label: "舌质", options: [{ id: 301, label: "淡红舌" }, { id: 302, label: "淡白色" }, { id: 303, label: "红舌" }, { id: 304, label: "青紫舌" }, { id: 305, label: "老嫩" }, { id: 306, label: "胖瘦" }, { id: 307, label: "瘦白" }, { id: 308, label: "点刺" }, { id: 309, label: "齿痕" }, { id: 310, label: "裂纹舌" }] },
      { key: "tongueMovement", label: "舌动态", options: [{ id: 321, label: "痿软" }, { id: 322, label: "强硬" }, { id: 323, label: "歪斜" }, { id: 324, label: "颤动" }, { id: 325, label: "吐弄" }] },
      { key: "coatingTexture", label: "苔质", options: [{ id: 331, label: "厚苔" }, { id: 332, label: "薄苔" }, { id: 333, label: "润苔" }, { id: 334, label: "燥苔" }, { id: 335, label: "腻苔" }, { id: 336, label: "腐苔" }, { id: 337, label: "剥落苔" }, { id: 338, label: "全苔" }, { id: 339, label: "偏苔" }] },
      { key: "coatingColor", label: "苔色", options: [{ id: 351, label: "白苔" }, { id: 352, label: "黄苔" }, { id: 353, label: "灰黑苔" }, { id: 354, label: "淡黄" }, { id: 355, label: "焦黄" }, { id: 356, label: "黄腻苔" }, { id: 357, label: "白腻苔" }] },
    ],
  },
  {
    key: "pulseDiagnosis",
    title: "切脉诊内容",
    englishTitle: "Pulse Diagnosis",
    groups: [
      { key: "pulsePositions", label: "部位", options: [{ id: 401, label: "左寸上头面" }, { id: 402, label: "寸心" }, { id: 403, label: "关肝" }, { id: 404, label: "尺肾阴" }, { id: 405, label: "尺下（生殖）" }, { id: 406, label: "右寸上头面" }, { id: 407, label: "寸肺" }, { id: 408, label: "关脾" }, { id: 409, label: "尺肾阳" }, { id: 410, label: "尺下（生殖）" }] },
      { key: "pulseQualities", label: "脉象", options: [{ id: 421, label: "浮沉" }, { id: 422, label: "快慢" }, { id: 423, label: "大小" }, { id: 424, label: "凹凸" }, { id: 425, label: "高低" }, { id: 426, label: "左右" }, { id: 427, label: "强弱" }, { id: 428, label: "软硬" }] },
      { key: "pulseNotes", label: "备注", type: "textarea" },
    ],
  },
  {
    key: "inquiry",
    title: "问诊内容",
    englishTitle: "Inquiry",
    groups: [
      { key: "coldHeat", label: "寒热", options: [{ id: 501, label: "发热恶寒" }, { id: 502, label: "不怕寒热" }, { id: 503, label: "怕风" }, { id: 504, label: "怕热" }, { id: 505, label: "怕冷" }, { id: 506, label: "怕热怕冷" }] },
      { key: "sweating", label: "汗", options: [{ id: 511, label: "出汗" }, { id: 512, label: "汗多" }, { id: 513, label: "汗少" }, { id: 514, label: "盗汗" }, { id: 515, label: "手足汗" }, { id: 516, label: "头腹汗" }] },
      { key: "pain", label: "疼痛", options: [{ id: 521, label: "偏正头疼" }, { id: 522, label: "胸" }, { id: 523, label: "腹" }, { id: 524, label: "肋" }, { id: 525, label: "腰" }, { id: 526, label: "背" }, { id: 527, label: "四肢" }, { id: 528, label: "全身" }] },
      { key: "headBodyDiscomfort", label: "头身不适", options: [{ id: 531, label: "头晕目眩" }, { id: 532, label: "心慌" }, { id: 533, label: "胸闷" }, { id: 534, label: "腰胀肋胀" }, { id: 535, label: "身重" }, { id: 536, label: "麻木" }, { id: 537, label: "耳鸣" }, { id: 538, label: "目痛目痒" }, { id: 539, label: "红眼" }] },
      { key: "sleep", label: "睡眠", options: [{ id: 541, label: "失眠易醒" }, { id: 542, label: "入睡困难" }, { id: 543, label: "多梦" }] },
      { key: "appetiteDiet", label: "饮食", options: [{ id: 551, label: "偏食" }, { id: 552, label: "厌食" }, { id: 553, label: "旺盛" }, { id: 554, label: "正常" }] },
      { key: "drinking", label: "饮水", options: [{ id: 561, label: "喜热" }, { id: 562, label: "喜凉" }, { id: 563, label: "渴饮" }, { id: 564, label: "不渴饮" }, { id: 565, label: "正常" }] },
      { key: "taste", label: "口味", options: [{ id: 571, label: "臭味" }, { id: 572, label: "甜味" }, { id: 573, label: "酸味" }, { id: 574, label: "苦味" }, { id: 575, label: "涩味" }, { id: 576, label: "咸腥味" }] },
      { key: "phlegmNasalDischarge", label: "痰涕", options: [{ id: 581, label: "色黄" }, { id: 582, label: "色白" }, { id: 583, label: "厚" }, { id: 584, label: "稀" }, { id: 585, label: "易咳出" }, { id: 586, label: "不易咳出" }] },
      { key: "stool", label: "大便", options: [{ id: 591, label: "便秘" }, { id: 592, label: "羊屎" }, { id: 593, label: "泄" }, { id: 594, label: "鸭屎" }, { id: 595, label: "排便不爽" }, { id: 596, label: "便粘" }, { id: 597, label: "便血" }, { id: 598, label: "完谷不化" }, { id: 599, label: "里急后重" }] },
      { key: "urination", label: "小便", options: [{ id: 601, label: "量少" }, { id: 602, label: "量多" }, { id: 603, label: "尿黄" }, { id: 604, label: "刺痛" }, { id: 605, label: "遗尿" }, { id: 606, label: "淋漓不净" }] },
      { key: "menstruationLeukorrheaPregnancyPostpartum", label: "经带产", options: [{ id: 611, label: "月经量多" }, { id: 612, label: "或少" }, { id: 613, label: "提前" }, { id: 614, label: "拖延" }, { id: 615, label: "崩漏" }, { id: 616, label: "闭经" }, { id: 617, label: "痛经" }, { id: 618, label: "血块" }, { id: 619, label: "暗紫" }, { id: 620, label: "白带" }, { id: 621, label: "多稀" }, { id: 622, label: "黄带" }, { id: 623, label: "有气味" }] },
      { key: "sexualFunction", label: "性功能", options: [{ id: 631, label: "早泄" }, { id: 632, label: "阳痿" }, { id: 633, label: "性冷淡" }, { id: 634, label: "不孕不育" }] },
      { key: "inquiryNotes", label: "备注", type: "textarea" },
    ],
  },
  {
    key: "fourDiagnosisSynthesisPatternDifferentiation",
    title: "四诊合参辩证分析",
    englishTitle: "Four-Diagnostic Synthesis and Pattern Differentiation",
    type: "textarea",
  },
  {
    key: "treatmentPlan",
    title: "治疗方案",
    englishTitle: "Treatment Plan",
    type: "textarea",
  },
  {
    key: "prescriptionMedication",
    title: "处方用药",
    englishTitle: "Prescription and Medication",
    type: "textarea",
  },
  {
    key: "generalNotes",
    title: "备注",
    englishTitle: "General Notes",
    type: "textarea",
  },
];

function getOptionLabelMap() {
  const labelMap = {};

  medicalRecordFormSections.forEach((section) => {
    if (!section.groups) {
      return;
    }

    section.groups.forEach((group) => {
      if (!group.options) {
        return;
      }

      labelMap[group.key] = {};

      group.options.forEach((option) => {
        labelMap[group.key][option.id] = option.label;
      });
    });
  });

  return labelMap;
}

module.exports = {
  TEXT_LIMIT,
  getOptionLabelMap,
  medicalRecordFormSections,
};
