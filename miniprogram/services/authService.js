function hasCloudEnv() {
  const app = getApp();
  return Boolean(app.globalData && app.globalData.env);
}

function getLocalAuthStatus() {
  return Promise.resolve({
    mode: "local",
    authorized: true,
    statusText: "本地原型模式：未配置云环境，暂不校验 OpenID 白名单",
    openid: "",
    role: "prototype",
  });
}

function checkAuth() {
  if (!hasCloudEnv()) {
    return getLocalAuthStatus();
  }

  return wx.cloud
    .callFunction({
      name: "medicalRecordApi",
      data: {
        type: "authCheck",
      },
    })
    .then((response) => {
      const result = response.result || {};

      if (result.authorized) {
        const userName = result.user.name || result.user.role || "";

        return {
          mode: "cloud",
          authorized: true,
          statusText: "已通过白名单认证",
          name: userName,
          openid: result.openid,
          role: result.user.role,
        };
      }

      return {
        mode: "cloud",
        authorized: false,
        statusText: result.message || "当前微信账号未通过白名单认证",
        name: "",
        openid: result.openid || "",
        role: "",
      };
    })
    .catch((error) => {
      return {
        mode: "cloud",
        authorized: false,
        statusText: "云函数 medicalRecordApi 未部署或调用失败",
        name: "",
        openid: "",
        role: "",
        errorMessage: error.errMsg || error.message || String(error),
      };
    });
}

module.exports = {
  checkAuth,
};
