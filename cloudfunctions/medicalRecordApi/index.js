const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

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

exports.main = async (event) => {
  switch (event.type) {
    case "authCheck":
      return await authCheck();
    default:
      return {
        success: false,
        authorized: false,
        status: "unknown_action",
        message: `Unknown action: ${event.type}`,
      };
  }
};
