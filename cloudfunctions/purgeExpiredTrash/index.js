const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const RETENTION_DAYS = 30;
const PAGE_SIZE = 100;

function pad(value) {
  return String(value).padStart(2, "0");
}

function getBeijingDate(date) {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000);
}

function formatBeijingDateTime(date) {
  const beijingDate = getBeijingDate(date);

  return [
    beijingDate.getUTCFullYear(),
    pad(beijingDate.getUTCMonth() + 1),
    pad(beijingDate.getUTCDate()),
  ].join("-") + " " + [
    pad(beijingDate.getUTCHours()),
    pad(beijingDate.getUTCMinutes()),
  ].join(":");
}

function getCutoffDateTime() {
  return formatBeijingDateTime(new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000));
}

async function getDeletedDocuments(collectionName) {
  const documents = [];
  let offset = 0;

  while (true) {
    const result = await db
      .collection(collectionName)
      .where({
        deletedAt: _.neq(""),
      })
      .skip(offset)
      .limit(PAGE_SIZE)
      .get();

    documents.push(...result.data);

    if (result.data.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return documents;
}

function isExpired(document, cutoffDateTime) {
  return document.deletedAt && String(document.deletedAt) <= cutoffDateTime;
}

async function removeDocuments(collectionName, ids) {
  if (!ids.length) {
    return 0;
  }

  await Promise.all(ids.map((id) => {
    return db.collection(collectionName).doc(id).remove();
  }));

  return ids.length;
}

async function getRecordsByPatientIds(patientIds) {
  if (!patientIds.length) {
    return [];
  }

  const records = [];
  let offset = 0;

  while (true) {
    const result = await db
      .collection("medical_records")
      .where({
        patientId: _.in(patientIds),
      })
      .skip(offset)
      .limit(PAGE_SIZE)
      .get();

    records.push(...result.data);

    if (result.data.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return records;
}

exports.main = async () => {
  const cutoffDateTime = getCutoffDateTime();
  const deletedPatients = await getDeletedDocuments("patients");
  const deletedRecords = await getDeletedDocuments("medical_records");
  const expiredPatientIds = deletedPatients
    .filter((patient) => {
      return isExpired(patient, cutoffDateTime);
    })
    .map((patient) => patient._id);
  let expiredRecordIds = deletedRecords
    .filter((record) => {
      return isExpired(record, cutoffDateTime) || expiredPatientIds.indexOf(record.patientId) >= 0;
    })
    .map((record) => record._id);

  if (expiredPatientIds.length) {
    const relatedRecords = await getRecordsByPatientIds(expiredPatientIds);

    expiredRecordIds = expiredRecordIds.concat(relatedRecords.map((record) => record._id));
  }

  expiredRecordIds = expiredRecordIds.filter((id, index, ids) => {
    return id && ids.indexOf(id) === index;
  });

  const removedRecordCount = await removeDocuments("medical_records", expiredRecordIds);
  const removedPatientCount = await removeDocuments("patients", expiredPatientIds);

  return {
    success: true,
    cutoffDateTime,
    removedPatientCount,
    removedRecordCount,
  };
};
