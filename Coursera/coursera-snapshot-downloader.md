## Coursera Snapshot Downloader

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
3. 通过用户脚本管理器的菜单命令，选择是否启用“下载截图”和“复制截图到剪切板”功能。
4. 打开任意 Coursera 视频页面，点击视频右下角的相机图标即可截图。如果启用了复制到剪切板功能，截图成功复制后，相机图标将暂时变为打钩图标以示确认。

---

### English Introduction

**Description**:  
This script adds screenshot functionality to all videos on the Coursera website. Users can quickly capture and download the current video frame by clicking a camera icon in the bottom-right corner of the video player. The screenshot file name is based on the current webpage title and the video's current time, with invalid characters automatically replaced by underscores to ensure valid filenames. Additionally, users can choose to copy the screenshot to the clipboard and receive visual feedback upon successful copying.

**Key Features**:

1. **One-Click Screenshot**: Adds a camera button to the video player for instant screenshots.
2. **Smart Naming**: Screenshot filenames include the webpage title and video timestamp for easy organization.
3. **Dynamic Content Support**: Works with dynamically loaded videos, ensuring compatibility with all content.
4. **Wide Compatibility**: Designed for all Coursera video pages.
5. **Toggle Options**: Easily switch between enabling/disabling download and clipboard copy functionalities via script menu commands.
6. **Operation Feedback**: After successfully copying a screenshot to the clipboard, the camera icon temporarily changes to a check mark icon for visual confirmation.

**How to Use**:

1. Install a userscript manager (e.g., Tampermonkey or Violentmonkey).
2. Add and enable this script.
3. Use the userscript manager's menu commands to toggle the "Download Screenshot" and "Copy Screenshot to Clipboard" features as desired.
4. Open any Coursera video page and click the camera icon in the bottom-right corner of the video to take a screenshot. If the clipboard copy feature is enabled, a check mark will briefly appear on the button to confirm the screenshot was copied successfully.
