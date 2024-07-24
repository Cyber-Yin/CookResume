![](https://raw.githubusercontent.com/Cyber-Yin/CookResume/main/public/home/desktop.png)

# 酷客简历

> 免费、开源、可自托管的在线简历编辑器

## 简介

酷客简历是一款免费开源的在线简历编辑器，可简化创建、更新和共享简历的过程。酷客简历使用在线表单编辑简历，不熟悉 Markdown 语法的用户也可以轻松创建出专业的简历。酷客简历还支持 PDF 导出，用户可以将简历导出为 PDF 格式，方便打印。最重要的是，酷客简历支持在线预览功能，通过分享简历外链，所有招聘者都可以直接阅读简历内容，无需下载简历。

## 功能特点

- 永久免费
- 表单编辑
- 多种主题
- 导出 PDF
- 响应式设计
- 支持在线预览
- 支持自托管

## 自托管说明

酷客简历使用 Remix.js 全栈框架搭建，后端采用 API 路由模式，通过 Prisma ORM 框架连接数据库。自托管酷客简历需要以下依赖：

- Node.js 18.x 及以上
- MySQL 8.x 及以上
- Redis 7.x 及以上
- SMTP 邮件服务器
- [图片上传服务](https://github.com/Cyber-Yin/EasyImage)

### 部署方式

#### 1.克隆仓库

```bash
git clone https://github.com/Cyber-Yin/CookResume.git

cd CookResume

yarn install

yarn build

yarn start
```

#### 2.使用 Docker

```bash
docker run \
--name CookResume \
-p 10001:10001 \
-e IMAGE_UPLOAD_TOKEN= \
-e IMAGE_API_ENDPOINT= \
-e SMTP_PASS= \
-e SMTP_USER= \
-e REDIS_PASSWORD= \
-e DATABASE_URL= \
-d cyberyin/cook-resume:latest
```

### 环境变量

```
SMTP_USER：SMTP 邮件服务器用户名
SMTP_PASS：SMTP 邮件服务器密钥
IMAGE_API_ENDPOINT：图片上传服务地址
IMAGE_UPLOAD_TOKEN：图片上传服务密钥
REDIS_HOST：Redis 服务器地址
REDIS_PORT：Redis 服务器端口
REDIS_USER：Redis 服务器用户名
REDIS_PASSWORD：Redis 服务器密码
REDIS_DB：Redis 数据库编号
DATABASE_URL：MySQL 数据库连接字符串
```
