# Markdown Files Requiring Translation

This document lists all Markdown files with Chinese content that need to be translated to English.

---

## Files to Translate

### 1. Chinese-Only Documentation (Translate Completely)

#### File: `知乎/知乎数值转换/readme.md`
**Current Content:**
```markdown
# 知乎数值转换

这是一个Tampermonkey脚本，用于将知乎中的数值转换为中文格式，如浏览次数可显示xx.xx万或亿。

## 使用

该脚本会在知乎网站中查找所有包含数值的元素，并将其转换为中文格式。例如，浏览次数将显示为"1.2万"或"1.2亿"。

## 注意

该脚本只能转换包含数值的元素，而不能转换其他类型的数据。如果您发现脚本无法正常工作，请尝试重新安装脚本或联系脚本作者。
```

---

#### File: `知乎/知乎盐选专栏下载（弃用）/readme.md`
**Current Content:**
```markdown
# 知乎盐选专栏爬取并下载为txt

这是一个Tampermonkey脚本，用于将知乎的盐选专栏自动爬取打包为txt文件。它使用fetch()函数发送HTTP请求，获取专栏页面的HTML内容。然后，它使用DOMParser()解析HTML内容，获取所有章节的链接和内容。最后，它将所有章节的内容拼接成一个txt文件，并将其下载到本地。

该脚本还创建了一个按钮，用户可以点击该按钮将专栏内容下载为txt文件。

## 使用

该脚本在专栏页面生效，用户可以点击按钮将专栏内容下载为txt文件。下载完成后，按钮将变为"下载完成！"状态。

## 注意

该脚本可能会对知乎网站的性能产生一定的影响。如果您发现脚本对网站的性能产生了负面影响，请尝试调整脚本的运行间隔或请求间隔。
```

---

#### File: `keylol/Keylol Helper/readme.md`
**Current Content:**
```markdown
# Keylol Helper 脚本简介

## 功能：

1. 自动检测是否有其乐消息

   - 在已登录的状态下检测是否有其乐消息，**即使您在站外**。若有则用 Windows10/11 自带的通知模块显示一个通知，点击可前往[消息提醒页面](https://keylol.com/home.php?mod=space&do=notice)
   - 默认间隔：5 分钟，通知显示 10 秒。

2. 添加自动回复功能
   - 在帖子上方有一个按钮，方便快速回帖，默认回复![enter image description here](https://keylol.com/static/image/smiley/steamcn_9/0450.gif)，可自定义
3. 抽奖自动加愿望单
   在【愿望单抽奖】的帖子中加一个按钮，点击可复制使用 chr 大佬写的 [ASF 插件](https://github.com/chr233/ASFEnhance) 添加愿望单代码，支持指定账号，默认为空。
4. 快速跳转激活 key
   - 在明 key 页面增加快速跳转 Steam 激活产品页面的按钮，方便快速跳转。
5. 检测是否已经回贴
   - 在论坛帖子内自动检测是否回过贴。感谢 @chr233 [出处](https://github.com/chr233/GM_Scripts/blob/master/Keylol/Am_I_Replied.js)

## 介绍
- 这其实是一个自用脚本，包括我个人常用的有需求的功能，还有一些从其他大佬那边借鉴来的功能。
```

---

#### File: `keylol/keylol板块自动按最新发布排序/readme.md`
**Current Content:**
```markdown
- 当你打开主页中的板块时，会自动跳转到最新发布模式。

# [keylol 板块自动按最新发布排序](https://greasyfork.org/zh-CN/scripts/453565-keylol-板块自动按最新发布排序)
```

---

#### File: `Steam/Steam-autotick/readme.md`
**Current Content:**
```markdown
## Steam 自动勾选同意用户协议复选框

- 这是一个简单的脚本，主要是懒得每次都点协议。。。不会真的有人去看协议吧
- 其乐地址：https://keylol.com/t854784-1-1
- 发布页面：[Steam 自动勾选同意用户协议复选框][1]

[1]: https://greasyfork.org/zh-CN/scripts/455146-steam%E8%87%AA%E5%8A%A8%E5%8B%BE%E9%80%89%E5%90%8C%E6%84%8F%E7%94%A8%E6%88%B7%E5%8D%8F%E8%AE%AE
```

---

#### File: `Steam/Add SteamDB Sale Item Into Steam Chart魔改/readme.md`
**Current Content:**
```markdown
## SteamDB 一键添加购物车魔改脚本

# 注意：本脚本为魔改脚本。需要搭配另外一个卡牌价格查询的脚本，详情可见其乐社区。

- 魔改自[https://greasyfork.org/zh-CN/scripts/432615-add-steamdb-sale-item-into-steam-chart](https://greasyfork.org/zh-CN/scripts/432615-add-steamdb-sale-item-into-steam-chart)

# 感谢：（不分前后）

- 感谢原作者@jklujklu
- 感谢卡牌查价脚本作者@lyzlyslyc

# 功能介绍

在 SteamDB 的 sales 页面提供多选自动加购物车功能。目前支持：

- 搭配查询卡牌价格脚本
- 筛选以及一键添加盈利的游戏（可以进一步筛选盈利值范围，比如大于 ARS$ 1.00）
- 并且统计相关金额

## 首发于其乐：[https://keylol.com/t861551-1-1](https://keylol.com/t861551-1-1)

# [SteamDB 加购物车魔改](https://greasyfork.org/zh-CN/scripts/457109-add-steamdb-sale-item-into-steam-chart魔改)
```

---

#### File: `Google/README.md`
**Current Content:**
```markdown
# Google 高级搜索助手

这是一个为 Google 添加高级搜索表单的用户脚本。它能在页面顶部添加一个可隐藏的高级搜索表单，使您能够更精确地搜索信息。

## 功能

- 在 Google 搜索页面顶部添加一个"高级搜索"按钮，点击按钮可显示高级搜索表单。
- 高级搜索表单包含了以下搜索选项：
  - `以下所有字词`：搜索结果中必须包含所有指定的关键字。
  - `与以下字词完全匹配`：搜索结果中必须包含完全匹配指定字词的结果。
  - `以下任意字词`：搜索结果中必须包含指定的任意一个关键字。
  - `排除以下字词`：搜索结果中不包含指定的关键字。
  - `包含的数字范围`：搜索结果中包含指定范围内的数字。
  - `最后更新时间`：搜索结果中包含指定更新时间的结果。
  - `网站或域名`：搜索结果中包含指定网站或域名的结果。
  - `文件类型`：搜索结果中包含指定文件类型的结果。
- 可以保存以前的搜索选项，这样在打开新页面时会自动填充表单。
- 提供清空按钮，可以清除表单中的数据。

## 使用方法

1. 安装一个用户脚本管理器，比如 Tampermonkey。
2. 安装用户脚本并启用它。
3. 在谷歌搜索页面打开后，您会在页面顶部看到一个名为"高级搜索"的按钮。
4. 点击"高级搜索"按钮，高级搜索表单将显示出来。
5. 在表单中填入您想要的高级搜索选项。
6. 点击"搜索"按钮进行高级搜索，或点击"清空"按钮清除表单数据。

注意：由于该脚本是针对谷歌搜索页面编写的，所以只能在谷歌搜索页面上使用。
```

---

#### File: `Gametame/readme.md`
**Current Content:**
```markdown
- gametame 自动领 bonus points，在主页面或者 bonus zone 页面生效。
- 使用脚本风险自负。
- 贴一个链接（doge）[https://gametame.com/][1]

# [Gametame 自动领取 bonus](https://greasyfork.org/zh-CN/scripts/456752-gametame自动领取bonus)

[1]: https://gametame.com/?join=2187448
```

---

#### File: `ChatGPT/Enhanced ChatGPT/readme.md`
**Current Content:**
```markdown
# 主要由 ChatGPT 编写的 ChatGPT 增强脚本，支持导出对话为 markdown。

- [ChatGPT 提取 markdown](https://greasyfork.org/zh-CN/scripts/459473-enhance-chatgpt-user-experience)
```

---

#### File: `Anti Bing Redirect/readme.md`
**Current Content:**
```markdown
# 说明

这个脚本用于取消Bing搜索结果的重定向。它通过解码URL中的加密字符串，并将其替换为原始URL，实现这一功能

该脚本还监听事件，以便在自动翻页时自动运行。

## 使用

该脚本会自动删除Bing搜索结果的重定向，并将其替换为原始URL。您可以在搜索结果页面上查看原始URL，而不必点击重定向链接。
```

---

### 2. Bilingual Documentation (Remove Chinese Sections)

#### File: `README.md`
**Instructions:** Remove lines 9-37 (the Chinese section), keep only English section

**Section to Remove:**
```markdown
## 中文

### 关于这个仓库

这个仓库收集了我开发的各种用户脚本，主要用于提升网页浏览体验和自动化日常操作。这些脚本大多是为了满足个人需求而编写的，现在分享给有类似需求的用户。

### 脚本特点

- **实用性强**：解决实际使用中的痛点问题
- **轻量简洁**：代码精简，不影响页面性能
- **持续更新**：根据用户反馈和网站变化持续改进

### 获取脚本

所有已发布的脚本都可以在 **[Greasy Fork](https://greasyfork.org/zh-CN/users/935206-shiquda)** 上找到和安装。

### 脚本类型

- **网页增强**：改善网站功能和用户体验
- **自动化工具**：简化重复性操作
- **内容提取**：帮助获取和整理网页内容
- **搜索辅助**：提升搜索效率

### 反馈与建议

如果遇到问题或有改进建议，欢迎通过以下方式联系：
- 在 Greasy Fork 脚本页面留言
- 提交 GitHub Issue
```

**Also update line 5:** Remove `[中文] / ` so it just says `[English]`

---

#### File: `Script finder/README.md`
**Instructions:** Remove lines 5-24 (Chinese content)

**Section to Remove:**
```markdown
Script Finder 是一个用户脚本（userscript），它可以帮助你在任何网站上查找和管理用户脚本。它提供了一种方便的方式来搜索和安装来自 Greasy Fork 的用户脚本。借助 Script Finder，你可以轻松地一键将自定义脚本添加到你喜爱的网站上，从而增强你的浏览体验。

### Features / 功能

-   Search for userscripts based on website domain / 根据网站域名搜索用户脚本
-   View detailed information about each script, including author, description, installs, version and rating / 查看每个脚本的详细信息，包括作者、描述、安装数量、版本和评分
-   Install userscripts with a single click / 一键安装用户脚本

### How to Use / 使用方法

1. Install a userscript manager such as Tampermonkey or Greasemonkey in your browser / 在浏览器中安装用户脚本管理器，例如 Tampermonkey 或 Greasemonkey
2. Install the Script Finder userscript by visiting the [Greasy Fork](https://greasyfork.org/scripts/472056-script-finder) and clicking the "Install" button / 访问 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/472056-script-finder) 网站并点击 "Install" 按钮来安装 Script Finder 脚本
3. After installation, a "Scripts" button will appear on your browser toolbar / 安装完成后，访问页面的右侧上会出现一个 "Scripts" 按钮
4. Click the "Scripts" button to open the Script Finder interface / 点击 "Scripts" 按钮打开 Script Finder 界面
5. Use the search bar to find userscripts for a specific website / 可以使用搜索栏根据特定网站查找用户脚本
6. Click on a userscript to view more details or install it by one-click / 点击一个用户脚本以查看更多详细信息或一键安装脚本

Enjoy discovering and using new userscripts with Script Finder! / 尽情发现和使用 Script Finder 提供的新用户脚本吧！

> Note: This userscript requires a userscript manager extension to be installed in your browser. / 注意：该用户脚本需要在浏览器中安装用户脚本管理器才能正常使用。
```

**Replace with English-only versions of Features and How to Use sections**

---

#### File: `General/readme.md`
**Instructions:** Remove lines 29-50 (Chinese section)

**Section to Remove:**
```markdown
## 简体中文

"Easy Web Page to Markdown" 是一个用户脚本，允许你将任何网页上选定的 HTML 转换为 Markdown 格式。这对于开发人员、内容创作者或经常需要将 HTML 内容转换为 Markdown 的任何人来说都非常有用。

### 特性

- **框选工具**：只需使用鼠标选择你想转换的 HTML 元素。
![框选工具](Clip_2024-02-08_15-13-03.png)
- **Markdown 预览**：转换后，将出现一个模态框，显示你选定的网页元素的 Markdown 转换结果。同时可以编辑 Markdown 并查看实时预览。
- **复制到剪贴板**：只需点击一下，你就可以将转换后的 Markdown 复制到你的剪贴板。
- **下载为 Markdown 文件**：可以将转换后的 Markdown 下载为 .md 文件。
![转换展示](Clip_2024-02-08_15-14-33.png)

### 使用方法

1. 安装用户脚本管理器，如 Tampermonkey 或 Greasemonkey。
2. 将此脚本添加到你的用户脚本管理器。
3. 在任何网页，按 `Ctrl + M` ，或者在脚本管理器的菜单打开功能，开始选择 HTML 元素。
4. 选择时，根据提示信息，使用鼠标滚轮或者方向键来选择元素。
5. 选择后，可以在左侧对转换后的 Markdown 代码进行编辑，右侧为其预览。
6. 可以将 Markdown 复制到剪贴板，也可以将其下载为 .md 文件，或者在代码中配置导入到Obsidian（使用[Obsidian Advanced URI](https://vinzent03.github.io/obsidian-advanced-uri/installing)）。
```

---

#### File: `Coursera/coursera-snapshot-downloader.md`
**Instructions:** Remove lines 3-23 (Chinese section)

**Section to Remove:**
```markdown
### 中文介绍

**功能描述**:
本脚本为 Coursera 网站上的所有视频添加截图功能。用户可以通过点击视频右下角的相机图标，快速截取当前视频画面并下载。截图文件的名称将基于当前网页的标题和视频的当前时间，自动替换无效字符为下划线，确保文件名的合法性。此外，用户可以选择将截图复制到剪切板，并在复制成功后获得视觉反馈。

**主要特点**:

1. **一键截图**: 在视频播放界面添加相机按钮，点击即可截取当前画面。
2. **智能命名**: 截图文件名包含网页标题和视频时间，方便整理和查找。
3. **动态加载支持**: 支持动态加载的视频内容，确保所有视频都能使用截图功能。
4. **兼容性强**: 适用于所有 Coursera 视频页面。
5. **功能开关管理**: 通过脚本菜单可以轻松切换截图后是否自动下载和/或复制到剪切板。
6. **操作反馈**: 成功复制截图到剪切板后，按钮会短暂显示打钩图标，提升用户体验。

**使用方法**:

1. 安装用户脚本管理器（如 Tampermonkey 或 Violentmonkey）。
2. 添加本脚本并启用。
3. 通过用户脚本管理器的菜单命令，选择是否启用"下载截图"和"复制截图到剪切板"功能。
4. 打开任意 Coursera 视频页面，点击视频右下角的相机图标即可截图。如果启用了复制到剪切板功能，截图成功复制后，相机图标将暂时变为打钩图标以示确认。
```

---

## Instructions for Translation

1. Translate all content naturally to English
2. Preserve all:
   - Markdown formatting
   - Links (update link text but keep URLs)
   - Code blocks and inline code
   - File structure and headings
3. For links to Greasy Fork with `/zh-CN/` in the URL, change to `/en/` where appropriate
4. Keep technical terms consistent (e.g., "userscript", "Tampermonkey")
5. Maintain the same tone and style (friendly, informative)

## Return Format

Please provide the translated content in this format:

```markdown
## File: [original path]
**Translated Content:**
[full English markdown here]

---
```

Or simply replace the content in each file directly and provide the complete translated files back to me.
