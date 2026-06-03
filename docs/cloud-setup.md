# 微信云开发配置步骤

## 1. 开通云开发环境

1. 在微信开发者工具中打开项目。
2. 点击顶部「云开发」。
3. 创建或选择一个云环境。
4. 复制环境 ID。
5. 把环境 ID 填入 `miniprogram/app.js` 的 `globalData.env`。

未填写环境 ID 时，小程序会以本地原型模式运行，不调用云函数。

## 2. 部署云函数

在微信开发者工具左侧找到：

```text
cloudfunctions/medicalRecordApi
```

右键选择：

```text
上传并部署：云端安装依赖
```

## 3. 创建白名单集合

在云开发控制台创建集合：

```text
authorized_users
```

添加一条管理员或医生记录：

```json
{
  "openid": "这里填首页显示的 OpenID",
  "name": "Katherine",
  "role": "admin",
  "active": true
}
```

`role` 建议先使用：

```text
admin
doctor
```

## 4. 验证认证状态

回到小程序首页，刷新编译。

如果配置成功，首页「访问控制」会显示：

```text
已通过白名单认证
```

如果看到“当前微信账号不在医案系统白名单中”，把首页显示的 OpenID 添加到 `authorized_users` 集合即可。
