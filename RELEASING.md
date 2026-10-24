# 发布维护

## GitHub Release 自动打包

推送形如 `v1.0.3` 的版本标签后，`.github/workflows/release.yml` 会：

1. 核对标签与 `package.json` 的版本一致，并读取 `CHANGELOG.md` 中对应版本的说明。
2. 检查 JavaScript 语法并运行测试；任一步失败都会停止发布。
3. 用 `npm pack` 生成 `dsh-exa-search-<版本>.tgz`，检查包内是否包含常见的凭据、状态、日志或备份文件。
4. 创建 GitHub Release，上传 `.tgz` 下载附件。预发布版本带 Pre-release 标记；已存在的 Release 不会被覆盖。

这套流程只发布到 GitHub，npm 发布仍需单独执行。

## 发布下一个版本

先修改 `package.json` 的版本号、补充 `CHANGELOG.md` 的同版本条目，再提交并推送代码。例如发布 `1.0.3`：

```sh
git add .
git commit -m "发布 1.0.3"
git push origin main
git tag v1.0.3
git push origin v1.0.3
```

只推送 `main` 分支会运行现有 CI，不会创建 Release。发布时需要另外推送版本标签。

在仓库的 **Actions → Release** 中查看执行结果。失败后修复问题，再按实际情况重跑失败任务或发布修正后的新版本；不要移动已经公开发布的版本标签。

## 提交身份与隐私

GitHub 根据提交中的作者名称与邮箱展示身份，名称来自 Git 的 `user.name`，邮箱来自 `user.email`。建议将当前仓库配置为自己的 GitHub 用户名与 GitHub 提供的 `noreply` 邮箱；在 GitHub **Settings → Emails** 查看对应地址。

修改配置只影响之后的新提交；已经推送的历史提交会保留原作者信息。
