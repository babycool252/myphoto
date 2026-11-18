# ATELIER — 免费个人图库网站

## 功能
- 手机/电脑响应式瀑布流、分类、搜索、大图浏览、原图链接
- Cloudinary 直接上传（unsigned preset）
- 导出 `gallery.json` 作为公开图库数据
- 纯静态网站，可免费部署到 GitHub Pages / Cloudflare Pages

## 1. 准备免费图片空间
1. 注册 https://cloudinary.com/ 并创建 Cloudinary Cloud。
2. 在 Cloudinary 控制台找到 **Cloud name**。
3. Settings → Upload → Upload presets，创建 **Unsigned** preset。
4. 建议在 preset 中设置允许的格式、文件大小上限、指定文件夹和其他安全限制。**不要在网站中使用 API Secret**。

注意：Unsigned 上传预设会暴露在网页代码中，任何知道它的人都可能向你的云空间上传文件并消耗额度。适合个人测试或小规模使用，不适合长期开放的公开上传后台。正式运营建议改成有登录和服务端签名的上传系统。Cloudinary 免费额度及政策以官网为准。

## 2. 上传图片
1. 打开部署后的网站，点击右上角「管理图库」。
2. 填入 Cloud name 和 Unsigned upload preset，保存。
3. 选择分类、标签，批量上传图片。
4. 点击「导出图库数据」，得到 `gallery.json`。
5. **把导出的 `gallery.json` 替换网站仓库中的同名文件，提交并重新部署。** 否则其他访客不会看到新上传的图片。

说明：未导出前，上传记录只存在当前浏览器的 localStorage 中；清除浏览器数据可能导致列表记录丢失，但不删除 Cloudinary 上的原图。可再次用图片 URL 构建数据。

## 3. 免费部署（GitHub Pages）
1. 注册 GitHub，创建一个公开仓库（例如 `atelier-gallery`）。
2. 将本文件夹中的 `index.html`、`style.css`、`app.js`、`gallery.json` 上传到仓库根目录。
3. 仓库 Settings → Pages → Build and deployment，选择 Deploy from a branch，分支 main，目录 /(root)。
4. 等待部署完成，网址一般是 `https://用户名.github.io/atelier-gallery/`。

注意：公开 GitHub 仓库内的 `gallery.json` 和图片 URL 对所有人可见。不要上传私人照片或敏感资料。Cloudinary 图片为公开可访问链接。

## 4. 重要限制
- 这是**可部署的第一版**，不是具备账号权限、在线数据库和自动同步的完整后台。
- 管理入口没有登录保护，任何访问者都能看到它；但上传仍需要有效的 preset。请严格限制 preset 并监控用量。更安全的生产方案需要登录/服务端鉴权。
- 本机新增列表与网站公开图库的同步依赖手动导出、替换 `gallery.json`。
- 免费服务有容量、流量和用量限制，不保证永久免费或无限制。
- 上传成功后若需要删除云端图片，请在 Cloudinary 控制台操作；清空本机记录不会删除云端文件。
