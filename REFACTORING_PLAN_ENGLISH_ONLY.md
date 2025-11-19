# Refactoring Plan: Convert Project to 100% English (No Chinese Characters)

**Version:** 1.0
**Date:** 2025-11-19
**Objective:** Remove ALL Chinese characters from the entire project and convert to English-only, maintaining full functionality

---

## Table of Contents

1. [Pre-Refactoring Phase](#phase-0-pre-refactoring-preparation)
2. [Phase 1: Safe Changes (Non-Breaking)](#phase-1-safe-changes-non-breaking)
3. [Phase 2: Critical Changes (Breaking)](#phase-2-critical-changes-breaking)
4. [Phase 3: Directory & File Restructuring](#phase-3-directory--file-restructuring)
5. [Phase 4: Testing & Validation](#phase-4-testing--validation)
6. [Phase 5: Documentation & Migration](#phase-5-documentation--migration)
7. [Rollback Strategy](#rollback-strategy)
8. [Translation Guidelines](#translation-guidelines)
9. [Risk Assessment](#risk-assessment)

---

## PHASE 0: Pre-Refactoring Preparation

### 0.1 Setup & Backup

**Priority:** CRITICAL
**Est. Time:** 30 minutes

- [ ] Create a new branch: `refactor/english-only-conversion`
- [ ] Tag current state as `pre-english-refactor` for easy rollback
- [ ] Create full backup of repository to external location
- [ ] Document current commit hash for reference
- [ ] Ensure all changes are committed before starting

### 0.2 Translation Preparation

**Priority:** HIGH
**Est. Time:** 2-4 hours

- [ ] Create translation mapping document for ALL Chinese text
  - [ ] List every Chinese string found in code
  - [ ] List every Chinese string in documentation
  - [ ] List every Chinese directory name
  - [ ] List every Chinese filename
- [ ] Create glossary for technical terms
  - [ ] Ensure consistency across all translations
  - [ ] Document context for ambiguous terms
- [ ] Identify Chinese platform-specific terms that should remain
  - [ ] Example: Chinese website UI elements that we're matching
  - [ ] Note: These are in the "breaking changes" category
- [ ] Get native English speaker to review proposed translations (recommended)

### 0.3 Testing Environment Setup

**Priority:** HIGH
**Est. Time:** 1 hour

- [ ] Set up testing environment for userscripts
- [ ] Install Tampermonkey/Violentmonkey in clean browser profile
- [ ] Document test URLs for each affected script
- [ ] Prepare test accounts for platforms that require login:
  - [ ] Bilibili account (for auto_judge script)
  - [ ] Keylol account (for Keylol Helper script)
  - [ ] Luogu account (for add-task script)
  - [ ] Steam account (for Steam scripts)
- [ ] Screenshot current working state of each script

### 0.4 Create Tracking Spreadsheet

**Priority:** MEDIUM
**Est. Time:** 1 hour

Create a detailed spreadsheet tracking:
- File path
- Type of change (comment, UI text, logic, storage key, etc.)
- Line numbers affected
- Original Chinese text
- Proposed English translation
- Breaking change? (Y/N)
- Testing required? (Y/N)
- Status (Not Started / In Progress / Completed / Tested)

---

## PHASE 1: Safe Changes (Non-Breaking)

**Total Est. Time:** 6-8 hours
**Risk Level:** LOW
**Can be done in parallel:** YES

These changes will NOT break functionality and can be done first.

### 1.1 Documentation Files Translation

**Priority:** LOW
**Est. Time:** 3-4 hours

#### 1.1.1 Main README.md

**File:** `/README.md`

- [ ] Decision: Keep bilingual OR convert to English-only?
  - **Option A:** Remove Chinese section entirely (lines 9-37)
  - **Option B:** Keep structure but improve English section
  - **Recommendation:** Keep bilingual for user accessibility, but this goes against 100% English requirement
  - **Final Decision:** Convert to English-only, remove lines 9-37
- [ ] Update header from "Shiquda's User Scripts" to keep as-is (already English)
- [ ] Remove Chinese navigation link "[中文]" from line 5
- [ ] Update link on line 5 to remove Chinese section reference
- [ ] Review English section for any improvements
- [ ] Ensure all links work after changes

#### 1.1.2 Script finder/README.md

**File:** `/Script finder/README.md`

- [ ] Remove Chinese section (lines 5-24)
- [ ] Keep English section (lines 1-3, 7-24)
- [ ] Update any Chinese-specific examples

#### 1.1.3 General/readme.md

**File:** `/General/readme.md`

- [ ] Remove Chinese section (lines 29-50)
- [ ] Keep English section (lines 1-26)
- [ ] Ensure images referenced work for English-only context

#### 1.1.4 Coursera/coursera-snapshot-downloader.md

**File:** `/Coursera/coursera-snapshot-downloader.md`

- [ ] Remove Chinese section (lines 3-23)
- [ ] Keep English section (lines 27-46)
- [ ] Update structure for English-only presentation

#### 1.1.5 Chinese-Only Documentation Files

Convert these entirely to English:

**Priority Order:**

1. [ ] `知乎/知乎数值转换/readme.md`
   - Translate title: "Zhihu Number Conversion"
   - Translate description
   - Translate usage instructions
   - Translate notes

2. [ ] `知乎/知乎盐选专栏下载（弃用）/readme.md`
   - Translate title: "Zhihu Premium Column Download (Deprecated)"
   - Translate content

3. [ ] `keylol/Keylol Helper/readme.md`
   - Translate title: "Keylol Helper Script Introduction"
   - Translate all feature descriptions
   - Keep Keylol-specific Chinese terms in context (e.g., "[明Key]" tag)

4. [ ] `keylol/keylol板块自动按最新发布排序/readme.md`
   - Translate all content

5. [ ] `Steam/Steam-autotick/readme.md`
   - Translate content

6. [ ] `Steam/Add SteamDB Sale Item Into Steam Chart魔改/readme.md`
   - Translate title and content
   - Note: "魔改" means "modified version"

7. [ ] `Google/README.md`
   - Translate all Chinese content

8. [ ] `Gametame/readme.md`
   - Translate content

9. [ ] `ChatGPT/Enhanced ChatGPT/readme.md`
   - Translate content

10. [ ] `Anti Bing Redirect/readme.md`
    - Translate content

### 1.2 Code Comments Translation

**Priority:** MEDIUM
**Est. Time:** 2-3 hours

Translate ALL Chinese comments to English in these files:

#### 1.2.1 Files with Extensive Comments

1. [ ] `General/html2md.user.js`
   - Line 44, 61, 94, 111, etc.
   - Translate all inline comments

2. [ ] `课堂派/ktp-document-downloader.user.js`
   - Lines 33, 44, 61, 71, 82, 92, 95, 102
   - Comprehensive comment translation

3. [ ] `不背单词/bbdc-newword-export.user.js`
   - Lines throughout with Chinese comments
   - Function descriptions

4. [ ] `知乎/知乎数值转换/zhihu figure convert.user.js`
   - Line 30: "Your code here..."
   - Any other Chinese comments

5. [ ] `luogu/luogu-add-task-in-batches.user.js`
   - Line 19: "如果包含'任务计划'" → "If contains 'Task Plan'"
   - Other comments

6. [ ] `keylol/Keylol Helper/Keylol Helper.user.js`
   - Extensive Chinese comments throughout
   - User configuration section comments (lines 24-27)
   - Function descriptions

7. [ ] `Steam/Add SteamDB Sale Item Into Steam Chart魔改/Add SteamDB Sale Item Into Steam Chart魔改.user.js`
   - All Chinese comments

8. [ ] `Bilibili/高清站外播放/high-quality-resolution.user.user.js`
   - Lines 16, 24, 31-32, 43, 49, 55, 61, 71
   - Function descriptions

9. [ ] `Bilibili/视频快进/fast-forward.user.js`
   - Lines 17-18, 26
   - Configuration comments

10. [ ] `Bilibili/风纪委员自动众议/auto_judge.user.js`
    - Lines 17, 22, 34, 84-85
    - Flow descriptions

11. [ ] `Baidu/easylearn/easylearn-helper.user.js`
    - Line 16, 20, 37
    - Logic descriptions

12. [ ] `Anti Bing Redirect/Anti Bing Redirect.user.js`
    - Lines 15, 27, 39, 42
    - Algorithm descriptions

13. [ ] `cryptopanic/cryptopanic-ad-blocker.user.js`
    - Line 24: "创建并插入style标签" → "Create and insert style tag"

### 1.3 UserScript Metadata Translation

**Priority:** MEDIUM
**Est. Time:** 1 hour

Handle bilingual @name and @description tags:

#### 1.3.1 Strategy Decision

**Options:**
- **Option A:** Remove Chinese @name:zh-CN and @description:zh-CN entirely
- **Option B:** Keep structure but duplicate English values
- **Recommendation:** Remove Chinese variants (Option A)

#### 1.3.2 Files to Update

1. [ ] `Google/Google-advance-search-assistant.user.js`
   - Remove `@name:zh-CN` (line 3)
   - Remove `@description:zh-CN` (line 7)

2. [ ] `Medium/medium-unlock.user.js`
   - Remove `@name:zh-CN` (line 3)
   - Remove `@description:zh-CN` (line 6)

3. [ ] `Github/jump-to-deepwiki.user.js`
   - Remove `@name:zh-CN` (line 3)
   - Remove `@description:zh-CN` (line 7)

4. [ ] `General/html2md.user.js`
   - Remove `@name:zh` (line 3)
   - Remove `@description:zh` (line 7)

5. [ ] `X/x-indent-autoclick.user.js`
   - Update `@name` to remove Chinese portion
   - Update `@description` to English only

### 1.4 Display Text (UI Labels) Translation

**Priority:** MEDIUM
**Est. Time:** 2 hours

These are button labels, status messages, etc. that users see but don't affect logic.

#### 1.4.1 不背单词/bbdc-newword-export.user.js

- [ ] Line 25: `'导出单词为txt'` → `'Export words to txt'`
- [ ] Line 35: `'随机打乱'` → `'Shuffle randomly'`
- [ ] Line 36: `'按顺序排列'` → `'Sort alphabetically'`
- [ ] Line 37: `'去除词组'` → `'Remove phrases'`
- [ ] Line 38: `'去重'` → `'Remove duplicates'`
- [ ] Line 58: `'正在导出...'` → `'Exporting...'`
- [ ] Line 64: `'导出完成！可以重新勾选选项设置导出格式！'` → `'Export complete! You can reselect options to set export format!'`
- [ ] Line 66: `'重新导出'` → `'Export again'`
- [ ] Line 84: `'正在加载单词列表...'` → `'Loading word list...'`
- [ ] Line 101: `'随机打乱和按顺序排列不能同时选择!'` → `'Random shuffle and alphabetical sort cannot be selected simultaneously!'`

#### 1.4.2 课堂派/ktp-document-downloader.user.js

- [ ] Line 33: Console.log message translation
- [ ] Line 44: Comment translation
- [ ] Line 61: "图片下载完毕" → "Image download complete"
- [ ] Line 71: "所有图片下载完毕" → "All images downloaded"
- [ ] Line 74: Console.log translations
- [ ] Line 83: Comment translation
- [ ] Line 86: Console error translation
- [ ] Line 104: `'下载为PDF'` → `'Download as PDF'`

#### 1.4.3 知乎/知乎数值转换/zhihu figure convert.user.js

- [ ] Line 6: `@description` translate to English
- [ ] Line 26-27: Update number format suffix from "万" and "亿" to "W" (10k) and "E" (100M) or keep numbers
  - **Decision needed:** Chinese number format vs Western format
  - **Recommendation:** Keep numeric values only, remove Chinese characters

#### 1.4.4 luogu/luogu-add-task-in-batches.user.js

- [ ] Line 34: `<h2>批量添加任务</h2>` → `<h2>Batch Add Tasks</h2>`
- [ ] Line 39: `添加` → `Add`
- [ ] Line 40: `清空` → `Clear`

#### 1.4.5 keylol/Keylol Helper/Keylol Helper.user.js

- [ ] Line 25: `"{:17_1010:}"` - This is an emoticon code, keep as-is
- [ ] Line 154: `'点击跳转到 Steam 激活页面'` → `'Click to jump to Steam activation page'`
- [ ] All console.log messages throughout the file

#### 1.4.6 ChatGPT/Enhanced ChatGPT/Enhanced ChatGPT.user.js

- [ ] Line 37: `"预览"` → `"Preview"`
- [ ] Line 55: `"预览"` → `"Preview"`

#### 1.4.7 Steam/Steam-autotick/Steam购买结账自动勾选同意用户协议.user.js

Review and translate any Chinese UI text.

#### 1.4.8 Google/Google-advance-search-assistant.user.js

- [ ] Lines 54-162: Translation object
  - Already has English translations defined
  - Remove all Chinese translations from the translation object
  - Set language to 'en' only
  - Remove language detection logic that allows Chinese

---

## PHASE 2: Critical Changes (Breaking)

**Total Est. Time:** 4-6 hours
**Risk Level:** HIGH
**MUST be done sequentially with testing after each**

### 2.1 Text Matching Logic Changes

These scripts match Chinese text on web pages. Changing them breaks functionality.

#### 2.1.1 Strategy Decision: CRITICAL

**Problem:** These scripts depend on Chinese text in the actual websites they're scraping.

**Options:**

**Option A: Multi-language Support (RECOMMENDED)**
- Keep Chinese text matching as primary
- Add English alternatives where possible
- Use OR logic: `(text === 'Chinese' || text === 'English')`
- Most future-proof

**Option B: English-Only (Breaks for Chinese users)**
- Replace all Chinese text with English equivalents
- Script only works if website is set to English language
- Acceptable if user base is English-only

**Option C: Variables/Constants**
- Extract all matched text to constants at top of file
- Makes it easy to swap or maintain both
- Good for maintainability

**RECOMMENDED APPROACH:** Hybrid of A + C
- Extract to constants with clear naming
- Support both languages in matching logic
- Document which website language settings are required

#### 2.1.2 Bilibili/风纪委员自动众议/auto_judge.user.js

**File:** `Bilibili/风纪委员自动众议/auto_judge.user.js`
**Risk Level:** CRITICAL
**Testing Required:** YES
**Bilibili Account Required:** YES

**Current Matched Strings:**
- Line 28: `'开始众议'` (Start deliberation)
- Line 51: `'合适'` (Appropriate)
- Line 53: `'好'` (Good)
- Line 55: `'不会观看'` (Won't watch)
- Line 57: `'确认提交'` (Confirm submit)

**Refactoring Steps:**

1. [ ] **Research Phase:**
   - [ ] Check if Bilibili has English language option
   - [ ] If yes, document what these buttons say in English
   - [ ] Test with English language setting
   - [ ] If no English option exists, this script MUST keep Chinese

2. [ ] **Implementation Options:**

   **If Bilibili has English:**
   ```javascript
   // Define button text constants
   const BUTTON_TEXT = {
       START_DELIBERATION: {
           zh: '开始众议',
           en: 'Start Deliberation'
       },
       APPROPRIATE: {
           zh: '合适',
           en: 'Appropriate'
       },
       GOOD: {
           zh: '好',
           en: 'Good'
       },
       WONT_WATCH: {
           zh: '不会观看',
           en: 'Won\'t Watch'
       },
       CONFIRM_SUBMIT: {
           zh: '确认提交',
           en: 'Confirm Submit'
       }
   };

   // Updated matching logic (line 28)
   if (buttonText === BUTTON_TEXT.START_DELIBERATION.zh ||
       buttonText === BUTTON_TEXT.START_DELIBERATION.en) {
       buttons[j].click();
       break;
   }
   ```

   **If Bilibili is Chinese-only:**
   ```javascript
   // Keep Chinese but extract to constants for clarity
   const BILIBILI_BUTTON_TEXT = {
       START_DELIBERATION: '开始众议',  // "Start Deliberation" in Chinese
       APPROPRIATE: '合适',              // "Appropriate" in Chinese
       GOOD: '好',                      // "Good" in Chinese
       WONT_WATCH: '不会观看',          // "Won't Watch" in Chinese
       CONFIRM_SUBMIT: '确认提交'       // "Confirm Submit" in Chinese
   };
   // Note: These values must remain in Chinese as Bilibili's UI is Chinese-only
   ```

3. [ ] **Update all button matching logic:**
   - [ ] Line 28: Start deliberation button
   - [ ] Lines 51-57: Vote buttons

4. [ ] **Add documentation comment:**
   ```javascript
   /**
    * NOTE: Bilibili's interface is only available in Chinese.
    * These button text values must match the actual Chinese UI text.
    * DO NOT translate these values to English.
    */
   ```

5. [ ] **Testing checklist:**
   - [ ] Script still finds "Start Deliberation" button
   - [ ] Auto-click on vote buttons works
   - [ ] Auto-click on "Won't Watch" works
   - [ ] Auto-click on "Confirm Submit" works
   - [ ] Loop to next case works

#### 2.1.3 luogu/luogu-add-task-in-batches.user.js

**File:** `luogu/luogu-add-task-in-batches.user.js`
**Risk Level:** CRITICAL
**Testing Required:** YES
**Luogu Account Required:** YES

**Current Matched String:**
- Line 20: `'任务计划'` (Task Plan)

**Refactoring Steps:**

1. [ ] **Research Phase:**
   - [ ] Check if Luogu has English language option
   - [ ] If yes, find English text for "任务计划"
   - [ ] Test with both language settings

2. [ ] **Implementation:**

   **Option A - Multi-language:**
   ```javascript
   const LUOGU_TEXT = {
       TASK_PLAN: {
           zh: '任务计划',
           en: 'Task Plan'  // Verify actual English text on site
       }
   };

   if (item.innerText.includes(LUOGU_TEXT.TASK_PLAN.zh) ||
       item.innerText.includes(LUOGU_TEXT.TASK_PLAN.en)) {
       target = item;
       break;
   }
   ```

   **Option B - Chinese-only with documentation:**
   ```javascript
   // Luogu uses Chinese-only interface
   const TASK_PLAN_TEXT = '任务计划';  // "Task Plan" - must match Luogu's UI

   if (item.innerText.includes(TASK_PLAN_TEXT)) {
       target = item;
       break;
   }
   ```

3. [ ] **Testing checklist:**
   - [ ] UI correctly identifies task plan section
   - [ ] Batch add UI is injected in correct location
   - [ ] Add button works
   - [ ] Clear button works

#### 2.1.4 keylol/Keylol Helper/Keylol Helper.user.js

**File:** `keylol/Keylol Helper/Keylol Helper.user.js`
**Risk Level:** HIGH
**Testing Required:** YES
**Keylol Account Required:** YES

**Current Matched Strings:**
- Line 149: `"[明Key]"` - Post tag for game keys
- Line 170: `"[活动推广]"` - Post tag for promotional activities
- Line 324: `"未定义操作"` - API error message

**Special Consideration:**
Keylol is a Chinese gaming forum. Tags like "[明Key]" are part of the site's culture.

**Refactoring Steps:**

1. [ ] **Research Phase:**
   - [ ] Verify Keylol is Chinese-only
   - [ ] Confirm these tags never appear in English
   - [ ] Check if API error messages are always Chinese

2. [ ] **Implementation:**

   ```javascript
   // Keylol forum tags - these are Chinese by design
   const KEYLOL_TAGS = {
       REVEALED_KEY: "[明Key]",      // "Revealed Key" - giveaway tag
       PROMOTION: "[活动推广]"        // "Promotional Activity" - event tag
   };

   const KEYLOL_API_ERRORS = {
       UNDEFINED_ACTION: "未定义操作",  // "Undefined action" - API error
       ERROR: "ERROR:"
   };

   // Line 149
   if (document.querySelector(".subforum_left_title_left_up")
       .innerText.indexOf(KEYLOL_TAGS.REVEALED_KEY) > -1) {
       // ... (key giving logic)
   }

   // Line 170
   return (document.querySelector(".subforum_left_title_left_up")
       .innerText.indexOf(KEYLOL_TAGS.PROMOTION) > -1);

   // Line 324
   const replied = !(html.includes(KEYLOL_API_ERRORS.UNDEFINED_ACTION) ||
                     html.includes(KEYLOL_API_ERRORS.ERROR));
   ```

3. [ ] **Add documentation:**
   ```javascript
   /**
    * Keylol Forum Constants
    * NOTE: Keylol is a Chinese-language gaming forum.
    * Post tags and API messages are in Chinese and cannot be translated.
    * These constants maintain Chinese values with English variable names for clarity.
    */
   ```

4. [ ] **Testing checklist:**
   - [ ] Script detects "[明Key]" posts correctly
   - [ ] "Jump to Steam" button appears on key posts
   - [ ] Script detects "[活动推广]" posts
   - [ ] Wishlist button appears on promotion posts
   - [ ] Reply detection works correctly
   - [ ] API error checking still functions

#### 2.1.5 Steam/Add SteamDB Sale Item Into Steam Chart魔改/Add SteamDB Sale Item Into Steam Chart魔改.user.js

**File:** `Steam/Add SteamDB Sale Item Into Steam Chart魔改/Add SteamDB Sale Item Into Steam Chart魔改.user.js`
**Risk Level:** MEDIUM
**Testing Required:** YES
**Steam Account Required:** YES

**Current Matched String:**
- Line 123: `.replace('购买', '')` - Removes "Buy" from title

**Refactoring Steps:**

1. [ ] **Research Phase:**
   - [ ] Check if this runs on Chinese Steam store or English
   - [ ] Test with both Steam language settings
   - [ ] Confirm what the buy button text is in each language

2. [ ] **Implementation:**

   ```javascript
   // Steam store language constants
   const STEAM_TEXT = {
       BUY: {
           zh: '购买',
           en: 'Buy'
       }
   };

   // Line 123 - remove buy text in either language
   const title = game.querySelector('.game_area_purchase_game h1')
       .firstChild.nodeValue
       .replace(/(^\s*)|(\s*$)/g, "")
       .replace(STEAM_TEXT.BUY.zh, '')
       .replace(STEAM_TEXT.BUY.en, '');
   ```

3. [ ] **Testing checklist:**
   - [ ] Game titles extracted correctly on Chinese Steam
   - [ ] Game titles extracted correctly on English Steam
   - [ ] "购买" is properly removed
   - [ ] "Buy" is properly removed
   - [ ] No double spaces in cleaned titles

### 2.2 Storage Key Changes (User Settings)

**Risk Level:** HIGH - User data loss
**Migration Required:** YES

#### 2.2.1 keylol/Keylol Helper/Keylol Helper.user.js

**File:** `keylol/Keylol Helper/Keylol Helper.user.js`
**Current Storage Keys (Chinese):**
- `'检测是否有其乐消息'` - Detect Keylol messages
- `'添加自动回复功能'` - Add auto-reply function
- `'抽奖自动加愿望单'` - Auto add to wishlist for giveaways
- `'快速跳转激活key'` - Quick jump to activate key
- `'检查是否已回贴'` - Check if already replied

**Problem:** Changing these keys will reset all users' saved preferences.

**Solution Options:**

**Option A: Migration Script (RECOMMENDED)**
```javascript
// Add at top of script - one-time migration
(function migrateStorageKeys() {
    const KEY_MIGRATION = {
        '检测是否有其乐消息': 'detectKeylolMessages',
        '添加自动回复功能': 'autoReplyEnabled',
        '抽奖自动加愿望单': 'autoAddToWishlist',
        '快速跳转激活key': 'quickJumpToActivateKey',
        '检查是否已回贴': 'checkIfAlreadyReplied'
    };

    // Migrate old Chinese keys to new English keys
    for (const [oldKey, newKey] of Object.entries(KEY_MIGRATION)) {
        const oldValue = GM_getValue(oldKey);
        if (oldValue !== undefined) {
            GM_setValue(newKey, oldValue);
            GM_deleteValue(oldKey);  // Clean up old key
        }
    }

    // Set migration flag to prevent running again
    if (!GM_getValue('storage_migrated_v1')) {
        GM_setValue('storage_migrated_v1', true);
    }
})();
```

**Option B: Break Clean (Not Recommended)**
- Just change the keys
- Users lose their settings
- Document in changelog

**Option C: Dual Support (Temporary)**
- Check both old and new keys
- Write to new keys only
- Remove old key support after 3 months

**Refactoring Steps:**

1. [ ] **Choose migration strategy:** Option A (Migration Script)

2. [ ] **Define new English keys:**
   ```javascript
   const STORAGE_KEYS = {
       DETECT_MESSAGES: 'detectKeylolMessages',
       AUTO_REPLY: 'autoReplyEnabled',
       AUTO_WISHLIST: 'autoAddToWishlist',
       QUICK_ACTIVATE: 'quickJumpToActivateKey',
       CHECK_REPLIED: 'checkIfAlreadyReplied'
   };
   ```

3. [ ] **Implement migration function** (see Option A above)

4. [ ] **Update all GM_getValue calls:**
   - [ ] Line 120: `GM_getValue('添加自动回复功能')` → `GM_getValue(STORAGE_KEYS.AUTO_REPLY)`
   - [ ] Line 148: `GM_getValue('快速跳转激活key')` → `GM_getValue(STORAGE_KEYS.QUICK_ACTIVATE)`
   - [ ] Line 163: `GM_getValue('抽奖自动加愿望单')` → `GM_getValue(STORAGE_KEYS.AUTO_WISHLIST)`
   - [ ] Line 209: `GM_getValue('检测是否有其乐消息')` → `GM_getValue(STORAGE_KEYS.DETECT_MESSAGES)`
   - [ ] Line 279: `GM_getValue('检测是否有其乎消息')` → `GM_getValue(STORAGE_KEYS.DETECT_MESSAGES)`
   - [ ] Line 295: `GM_getValue('检测是否有其乐消息')` → `GM_getValue(STORAGE_KEYS.DETECT_MESSAGES)`
   - [ ] Line 307: `GM_getValue('检查是否已回贴')` → `GM_getValue(STORAGE_KEYS.CHECK_REPLIED)`

5. [ ] **Update feature info array (lines 34-38):**
   ```javascript
   const FEATURE_INFO = [
       'Detect Keylol messages',
       'Add auto-reply function',
       'Auto add to wishlist for giveaways',
       'Quick jump to activate key',
       'Check if already replied'
   ];
   ```

6. [ ] **Update setMenu function:**
   - Storage keys already use feature names from array
   - Should automatically work with English names

7. [ ] **Testing checklist:**
   - [ ] Install old version, set all preferences
   - [ ] Install new version
   - [ ] Verify all settings are preserved
   - [ ] Verify old keys are deleted
   - [ ] Verify new settings can be toggled
   - [ ] Verify fresh install works correctly

8. [ ] **Create rollback script** (just in case):
   ```javascript
   // Emergency rollback script
   const OLD_KEYS = {
       'detectKeylolMessages': '检测是否有其乐消息',
       'autoReplyEnabled': '添加自动回复功能',
       'autoAddToWishlist': '抽奖自动加愿望单',
       'quickJumpToActivateKey': '快速跳转激活key',
       'checkIfAlreadyReplied': '检查是否已回贴'
   };

   for (const [newKey, oldKey] of Object.entries(OLD_KEYS)) {
       const value = GM_getValue(newKey);
       if (value !== undefined) {
           GM_setValue(oldKey, value);
       }
   }
   ```

### 2.3 Translation Object Updates

#### 2.3.1 Google/Google-advance-search-assistant.user.js

**File:** `Google/Google-advance-search-assistant.user.js`
**Lines:** 54-163

**Current State:** Has full translation object with both Chinese and English

**Refactoring Steps:**

1. [ ] **Remove all Chinese translations:**
   ```javascript
   // BEFORE:
   const translation = {
       as_q: {
           "zh-CN": "搜索字词:",
           en: "Search word:",
       },
       // ... etc
   }

   // AFTER:
   const TEXT = {
       as_q: "Search word:",
       as_epq: "Match the following words exactly:",
       as_oq: "Contains any of the following words:",
       as_eq: "Exclude the following words:",
       as_nlo: "Number range: from",
       as_nhi: "to:",
       // ... etc
   };
   ```

2. [ ] **Remove language selection logic:**
   - [ ] Lines 227-244: Remove entire language detection block
   - [ ] Hard-set to English only

3. [ ] **Update all text references:**
   - [ ] Line 249: `translation["advancedSearch"][language]` → `TEXT.advancedSearch`
   - [ ] Line 277: `translation["as_q"][language]` → `TEXT.as_q`
   - [ ] Continue for all text references

4. [ ] **Simplify params object:**
   - [ ] Lines 276-308: Update to use TEXT object directly

5. [ ] **Testing checklist:**
   - [ ] Advanced search button appears
   - [ ] Form displays correctly
   - [ ] All labels are in English
   - [ ] Search functionality works
   - [ ] Clear button works

---

## PHASE 3: Directory & File Restructuring

**Total Est. Time:** 2-3 hours
**Risk Level:** LOW (no code dependencies)
**Can be done last:** YES

### 3.1 Directory Renaming Plan

**Total Directories to Rename:** 10

**Git Best Practice:** Use `git mv` to preserve history

#### 3.1.1 Top-Level Directories

1. [ ] `不背单词/` → `bbdc-vocabulary/`
   ```bash
   git mv "不背单词" "bbdc-vocabulary"
   ```

2. [ ] `知乎/` → `zhihu/`
   ```bash
   git mv "知乎" "zhihu"
   ```

3. [ ] `课堂派/` → `ketangpai-classroom/`
   ```bash
   git mv "课堂派" "ketangpai-classroom"
   ```

#### 3.1.2 Subdirectories - Zhihu

4. [ ] `知乎/知乎数值转换/` → `zhihu/number-conversion/`
   ```bash
   git mv "zhihu/知乎数值转换" "zhihu/number-conversion"
   ```

5. [ ] `知乎/知乎盐选专栏下载（弃用）/` → `zhihu/premium-column-download-deprecated/`
   ```bash
   git mv "zhihu/知乎盐选专栏下载（弃用）" "zhihu/premium-column-download-deprecated"
   ```

#### 3.1.3 Subdirectories - Keylol

6. [ ] `keylol/keylol板块自动按最新发布排序/` → `keylol/board-auto-sort-by-latest/`
   ```bash
   git mv "keylol/keylol板块自动按最新发布排序" "keylol/board-auto-sort-by-latest"
   ```

#### 3.1.4 Subdirectories - Steam

7. [ ] `Steam/Add SteamDB Sale Item Into Steam Chart魔改/` → `Steam/add-steamdb-sale-to-cart-modified/`
   ```bash
   git mv "Steam/Add SteamDB Sale Item Into Steam Chart魔改" "Steam/add-steamdb-sale-to-cart-modified"
   ```

#### 3.1.5 Subdirectories - Bilibili

8. [ ] `Bilibili/视频快进/` → `Bilibili/video-fast-forward/`
   ```bash
   git mv "Bilibili/视频快进" "Bilibili/video-fast-forward"
   ```

9. [ ] `Bilibili/风纪委员自动众议/` → `Bilibili/auto-discipline-committee-voting/`
   ```bash
   git mv "Bilibili/风纪委员自动众议" "Bilibili/auto-discipline-committee-voting"
   ```

10. [ ] `Bilibili/高清站外播放/` → `Bilibili/high-quality-external-playback/`
    ```bash
    git mv "Bilibili/高清站外播放" "Bilibili/high-quality-external-playback"
    ```

### 3.2 File Renaming Plan

**Total Files to Rename:** 13

#### 3.2.1 UserScript Files

1. [ ] `课堂派/ktp-document-downloader.user.js` → `ketangpai-classroom/ktp-document-downloader.user.js`
   - Already renamed via directory change

2. [ ] `知乎/知乎数值转换/zhihu figure convert.user.js` → `zhihu/number-conversion/zhihu-figure-convert.user.js`
   ```bash
   git mv "zhihu/number-conversion/zhihu figure convert.user.js" "zhihu/number-conversion/zhihu-figure-convert.user.js"
   ```
   - Note: Also fix space in filename

3. [ ] `知乎/知乎盐选专栏下载（弃用）/zhihu column download.user.js` → `zhihu/premium-column-download-deprecated/zhihu-column-download.user.js`
   ```bash
   git mv "zhihu/premium-column-download-deprecated/zhihu column download.user.js" "zhihu/premium-column-download-deprecated/zhihu-column-download.user.js"
   ```
   - Note: Also fix space in filename

4. [ ] `不背单词/bbdc-newword-export.user.js` → `bbdc-vocabulary/bbdc-newword-export.user.js`
   - Already renamed via directory change

5. [ ] `keylol/keylol板块自动按最新发布排序/keylol板块自动按最新发布排序.user.js` → `keylol/board-auto-sort-by-latest/keylol-board-auto-sort.user.js`
   ```bash
   git mv "keylol/board-auto-sort-by-latest/keylol板块自动按最新发布排序.user.js" "keylol/board-auto-sort-by-latest/keylol-board-auto-sort.user.js"
   ```

6. [ ] `keylol/Keylol Helper/Keylol Helper.user.js` → Keep as-is (already English with space)
   - Optional: Rename to `keylol-helper.user.js` (remove space)

7. [ ] `Steam/Steam-autotick/Steam购买结账自动勾选同意用户协议.user.js` → `Steam/Steam-autotick/steam-auto-accept-agreement.user.js`
   ```bash
   git mv "Steam/Steam-autotick/Steam购买结账自动勾选同意用户协议.user.js" "Steam/Steam-autotick/steam-auto-accept-agreement.user.js"
   ```

8. [ ] `Steam/Add SteamDB Sale Item Into Steam Chart魔改/Add SteamDB Sale Item Into Steam Chart魔改.user.js` → `Steam/add-steamdb-sale-to-cart-modified/add-steamdb-sale-to-cart-modified.user.js`
   ```bash
   git mv "Steam/add-steamdb-sale-to-cart-modified/Add SteamDB Sale Item Into Steam Chart魔改.user.js" "Steam/add-steamdb-sale-to-cart-modified/add-steamdb-sale-to-cart-modified.user.js"
   ```

9. [ ] `Script finder/Script finder.user.js` → `Script finder/script-finder.user.js`
   - Optional: Remove space, make lowercase

10. [ ] `Gametame/Gametame自动领取bonus.user.js` → `Gametame/gametame-auto-collect-bonus.user.js`
    ```bash
    git mv "Gametame/Gametame自动领取bonus.user.js" "Gametame/gametame-auto-collect-bonus.user.js"
    ```

11. [ ] `ChatGPT/Enhanced ChatGPT/Enhanced ChatGPT.user.js` → `ChatGPT/Enhanced ChatGPT/enhanced-chatgpt.user.js`
    - Optional: Remove spaces, make lowercase

12. [ ] `Bilibili/高清站外播放/high-quality-resolution.user.user.js` → `Bilibili/high-quality-external-playback/high-quality-resolution.user.js`
    - Note: Also fix double `.user.user.js` extension

13. [ ] `Bilibili/视频快进/fast-forward.user.js` → `Bilibili/video-fast-forward/fast-forward.user.js`
    - Already renamed via directory change

14. [ ] `Bilibili/风纪委员自动众议/auto_judge.user.js` → `Bilibili/auto-discipline-committee-voting/auto-judge.user.js`
    - Already renamed via directory change
    - Optional: Rename to `auto-discipline-judge.user.js`

15. [ ] `Anti Bing Redirect/Anti Bing Redirect.user.js` → `Anti Bing Redirect/anti-bing-redirect.user.js`
    - Optional: Remove space, make lowercase

#### 3.2.2 Documentation Files

Most will be automatically renamed when directories are renamed.

Additional file renames:

1. [ ] Fix any inconsistent casing in README files
   - [ ] Ensure all are either `README.md` or `readme.md`
   - [ ] Recommended: Use `README.md` (uppercase) for consistency

### 3.3 Update Internal File References

Even though there are no code dependencies, some files might reference their own names:

1. [ ] Search for any `@namespace` URLs containing Chinese
2. [ ] Update `@name` fields to match new filenames where appropriate
3. [ ] Update any documentation that references old paths

### 3.4 Verify No Broken Links

1. [ ] Check if main README links to subdirectory READMEs
2. [ ] Update any relative path links
3. [ ] Update any documentation cross-references

---

## PHASE 4: Testing & Validation

**Total Est. Time:** 4-6 hours
**Priority:** CRITICAL

### 4.1 Pre-Testing Checklist

- [ ] All changes committed to branch
- [ ] No Chinese characters remaining (run verification script)
- [ ] All files renamed successfully
- [ ] Git history preserved

### 4.2 Automated Validation

#### 4.2.1 Create Validation Script

**File:** `scripts/validate-english-only.sh`

```bash
#!/bin/bash

echo "🔍 Validating English-Only Refactoring..."
echo ""

# Find any remaining Chinese characters in code files
echo "Checking for Chinese characters in .js files..."
CHINESE_IN_JS=$(grep -r -P '[\x{4e00}-\x{9fff}]' --include="*.js" . || true)
if [ -n "$CHINESE_IN_JS" ]; then
    echo "❌ FAIL: Chinese characters found in JS files:"
    echo "$CHINESE_IN_JS"
    exit 1
else
    echo "✅ PASS: No Chinese in JS files"
fi

# Check documentation files
echo ""
echo "Checking for Chinese characters in .md files..."
CHINESE_IN_MD=$(grep -r -P '[\x{4e00}-\x{9fff}]' --include="*.md" . || true)
if [ -n "$CHINESE_IN_MD" ]; then
    echo "❌ FAIL: Chinese characters found in MD files:"
    echo "$CHINESE_IN_MD"
    exit 1
else
    echo "✅ PASS: No Chinese in MD files"
fi

# Check for Chinese in directory names
echo ""
echo "Checking for Chinese in directory names..."
CHINESE_DIRS=$(find . -type d -name '*[一-龥]*' || true)
if [ -n "$CHINESE_DIRS" ]; then
    echo "❌ FAIL: Chinese characters found in directory names:"
    echo "$CHINESE_DIRS"
    exit 1
else
    echo "✅ PASS: No Chinese in directory names"
fi

# Check for Chinese in filenames
echo ""
echo "Checking for Chinese in filenames..."
CHINESE_FILES=$(find . -type f -name '*[一-龥]*' || true)
if [ -n "$CHINESE_FILES" ]; then
    echo "❌ FAIL: Chinese characters found in filenames:"
    echo "$CHINESE_FILES"
    exit 1
else
    echo "✅ PASS: No Chinese in filenames"
fi

echo ""
echo "✅ All validation checks passed!"
```

- [ ] Create validation script
- [ ] Make executable: `chmod +x scripts/validate-english-only.sh`
- [ ] Run validation script
- [ ] Fix any failures
- [ ] Re-run until all pass

### 4.3 Manual Testing by Script

Test each modified script individually.

#### 4.3.1 Critical Scripts (MUST test)

**1. Bilibili/auto-discipline-committee-voting/auto-judge.user.js**

Testing Steps:
- [ ] Install script in Tampermonkey
- [ ] Log into Bilibili account
- [ ] Navigate to: https://www.bilibili.com/judgement/index
- [ ] Verify "Start Deliberation" button is auto-clicked
- [ ] Verify vote buttons work
- [ ] Verify submission works
- [ ] Verify loop to next case works
- [ ] Test with both Chinese and English site language (if applicable)

**2. luogu/luogu-add-task-in-batches.user.js**

Testing Steps:
- [ ] Install script
- [ ] Log into Luogu account
- [ ] Navigate to: https://www.luogu.com.cn/
- [ ] Verify batch add UI appears in correct location
- [ ] Add multiple problem IDs
- [ ] Verify problems are added to task list
- [ ] Test clear button
- [ ] Verify error handling

**3. keylol/Keylol Helper/Keylol Helper.user.js**

Testing Steps:
- [ ] Install OLD version of script
- [ ] Configure ALL settings via menu
- [ ] Note which settings are enabled
- [ ] Install NEW version (with migration)
- [ ] Verify all settings preserved
- [ ] Test each feature:
  - [ ] Message detection notification
  - [ ] Auto-reply on posts
  - [ ] Wishlist button on giveaway posts
  - [ ] Steam activation button on key posts
  - [ ] Reply detection
- [ ] Toggle settings and verify they save
- [ ] Verify no Chinese in menu items

**4. Steam/add-steamdb-sale-to-cart-modified/add-steamdb-sale-to-cart-modified.user.js**

Testing Steps:
- [ ] Install script
- [ ] Navigate to SteamDB sales page
- [ ] Verify multi-select functionality works
- [ ] Verify "Buy" text is removed from titles (Chinese Steam)
- [ ] Verify "Buy" text is removed from titles (English Steam)
- [ ] Test batch add to cart
- [ ] Verify price calculations

**5. Google/Google-advance-search-assistant.user.js**

Testing Steps:
- [ ] Install script
- [ ] Navigate to Google search
- [ ] Verify "Advanced Search" button appears in English
- [ ] Click button, verify form appears in English
- [ ] Fill out various search fields
- [ ] Verify search executes correctly
- [ ] Verify all labels and options are English
- [ ] Test clear button
- [ ] Verify settings persist across page loads

#### 4.3.2 Medium Priority Scripts

**6. 不背单词/bbdc-newword-export.user.js**

- [ ] Verify button text is English
- [ ] Verify export works
- [ ] Verify checkbox labels are English
- [ ] Verify status messages are English

**7. 课堂派/ktp-document-downloader.user.js**

- [ ] Verify download button appears
- [ ] Test PDF download
- [ ] Verify console messages are English

**8. 知乎/number-conversion/zhihu-figure-convert.user.js**

- [ ] Verify number conversion works
- [ ] Check if "万" and "亿" removed or replaced

**9. Medium/medium-unlock.user.js**

- [ ] Verify floating button appears
- [ ] Test unlock functionality
- [ ] Verify hover text English

**10. Github/jump-to-deepwiki.user.js**

- [ ] Verify DeepWiki button appears
- [ ] Test navigation
- [ ] Verify button text

**11. General/html2md.user.js**

- [ ] Test Ctrl+M shortcut
- [ ] Verify selection guide is English
- [ ] Test conversion
- [ ] Verify modal buttons are English
- [ ] Test copy functionality
- [ ] Test download functionality

#### 4.3.3 Low Priority Scripts (Quick check)

- [ ] X/x-indent-autoclick.user.js - Verify auto-click works
- [ ] Bilibili/video-fast-forward/fast-forward.user.js - Test fast forward
- [ ] Baidu/easylearn/easylearn-helper.user.js - Test answer reveal
- [ ] Anti Bing Redirect/anti-bing-redirect.user.js - Test redirect removal
- [ ] cryptopanic/cryptopanic-ad-blocker.user.js - Test ad blocking
- [ ] Gametame/gametame-auto-collect-bonus.user.js - Test auto-collect
- [ ] ChatGPT/Enhanced ChatGPT/enhanced-chatgpt.user.js - Test export

### 4.4 Regression Testing

Test scripts that weren't modified to ensure nothing broke:

- [ ] Test 3-5 unmodified scripts
- [ ] Verify they still install and run correctly

### 4.5 Documentation Validation

- [ ] README.md renders correctly on GitHub
- [ ] All subdirectory READMEs render correctly
- [ ] No broken links
- [ ] All images load
- [ ] Greasy Fork links still work

---

## PHASE 5: Documentation & Migration

**Total Est. Time:** 2-3 hours

### 5.1 Create Migration Guide

**File:** `MIGRATION_GUIDE.md`

Create comprehensive guide including:

1. [ ] What changed and why
2. [ ] Breaking changes list
3. [ ] User action required (if any)
4. [ ] How to rollback if needed
5. [ ] FAQ section

### 5.2 Update CHANGELOG

**File:** `CHANGELOG.md`

Create or update with:

```markdown
## [Version X.X.X] - 2025-11-19

### Major Refactoring: English-Only Conversion

#### Changed
- Converted all Chinese characters to English throughout project
- Renamed 10 directories from Chinese to English
- Renamed 13 files from Chinese to English
- Translated all code comments to English
- Translated all UI text to English
- Translated all documentation to English

#### Breaking Changes
- **Keylol Helper**: Settings storage keys changed
  - Automatic migration script included
  - User settings will be preserved
  - Old keys: '检测是否有其乐消息', etc.
  - New keys: 'detectKeylolMessages', etc.

#### Technical Notes
- Scripts matching Chinese website UI text use constants for clarity
- Some scripts must match Chinese UI elements (site-dependent)
- Migration script runs once automatically for Keylol Helper

#### File Renames
- `不背单词/` → `bbdc-vocabulary/`
- `知乎/` → `zhihu/`
- (... full list ...)

#### For Developers
- All comments now in English
- Variable names unchanged (already English)
- Constants added for matched text strings
- See REFACTORING_PLAN_ENGLISH_ONLY.md for details
```

### 5.3 Update Contributing Guidelines

If project has `CONTRIBUTING.md`:

- [ ] Add: "All code, comments, and documentation must be in English"
- [ ] Add: "Variable names must be in English"
- [ ] Add: "UI text should be in English (or use translation system)"

### 5.4 Update Package/Project Metadata

If applicable:

- [ ] Update package.json description (if exists)
- [ ] Update any other project metadata files

### 5.5 User Communication

**For Greasy Fork (if scripts are published):**

1. [ ] Update each script's description page
2. [ ] Add update note about English-only conversion
3. [ ] Mention that Keylol Helper will preserve settings
4. [ ] Update version numbers
5. [ ] Update screenshots if they showed Chinese text

**For GitHub:**

1. [ ] Create GitHub Release with detailed notes
2. [ ] Pin issue about the refactoring for visibility
3. [ ] Update repository description
4. [ ] Consider creating discussion thread

---

## ROLLBACK STRATEGY

### Emergency Rollback

If critical issues are discovered after merge:

1. [ ] **Immediate Rollback:**
   ```bash
   git revert <commit-hash-range>
   # OR
   git reset --hard <pre-refactor-tag>
   git push --force
   ```

2. [ ] **Restore Previous Version to Users:**
   - Publish old versions back to Greasy Fork
   - Create hotfix branch from pre-refactor state
   - Document issues found

### Partial Rollback

If only specific scripts have issues:

1. [ ] Identify problematic script(s)
2. [ ] Cherry-pick old version of that script:
   ```bash
   git checkout <pre-refactor-tag> -- path/to/script.user.js
   git commit -m "Rollback: Revert script.user.js due to issue #XXX"
   ```
3. [ ] Update version number
4. [ ] Re-publish specific script

### Keylol Helper Storage Rollback

If storage migration fails:

1. [ ] Run rollback script (from Phase 2.2.1, step 8)
2. [ ] Publish old version
3. [ ] Investigate migration issues
4. [ ] Fix and re-release

---

## TRANSLATION GUIDELINES

### General Principles

1. **Accuracy Over Literal:**
   - Translate meaning, not word-for-word
   - Consider context and intent

2. **Consistency:**
   - Use same translation for same term throughout
   - Example: "任务" always → "task" (not "mission", "quest", etc.)

3. **Brevity:**
   - Keep translations concise
   - UI text should fit in buttons/labels

4. **Technical Terms:**
   - Preserve technical accuracy
   - Don't oversimplify

### Specific Guidance

#### Button Text
- Keep short and clear
- Use title case for buttons
- Examples:
  - "导出" → "Export" (not "Export Data")
  - "清空" → "Clear" (not "Clear All Data")
  - "确认" → "Confirm" (not "Confirm Action")

#### Status Messages
- Use complete sentences
- Include punctuation
- Examples:
  - "正在加载..." → "Loading..."
  - "操作成功!" → "Operation successful!"

#### Error Messages
- Be specific and helpful
- Suggest solutions if possible
- Examples:
  - "无法找到元素" → "Element not found"
  - "请登录后再试" → "Please log in and try again"

#### Comments
- Use complete sentences
- Start with capital letter
- End with period
- Examples:
  - "// 创建按钮" → "// Create button"
  - "// 检查用户是否已登录" → "// Check if user is logged in"

#### Variable Names in Comments
- When referring to variables, use exact names
- Example:
  - "// 使用 setTimeout 延迟执行" → "// Use setTimeout to delay execution"

### Chinese Terms That May Not Need Translation

Some Chinese-specific concepts may need special handling:

1. **Platform-specific tags:**
   - "[明Key]" - Keep as-is, explain in comments
   - "[活动推广]" - Keep as-is, explain in comments

2. **Cultural terms:**
   - "其乐" (Keylol) - Use English name if exists, otherwise romanize

3. **Number formats:**
   - "万" (10,000) - Consider keeping or use "k"
   - "亿" (100,000,000) - Consider keeping or use "M"

### Translation Tools

Recommended tools for verification:

1. **Google Translate** - Quick reference
2. **DeepL** - More natural translations
3. **ChatGPT/Claude** - Context-aware translations
4. **Native Speaker** - Final review (recommended)

### Quality Checklist

Before finalizing translations:

- [ ] Read translated text out loud - does it sound natural?
- [ ] Check for consistency across files
- [ ] Verify technical accuracy
- [ ] Ensure UI text fits in allocated space
- [ ] Check for missing punctuation
- [ ] Verify no "Chinglish" patterns

---

## RISK ASSESSMENT

### High Risk Areas

| Area | Risk Level | Mitigation |
|------|-----------|------------|
| Text matching logic | 🔴 CRITICAL | Extensive testing, multi-language support |
| Storage key changes | 🔴 HIGH | Migration script, dual support period |
| Bilibili scripts | 🔴 HIGH | Test with actual website, multiple test cases |
| Keylol Helper | 🔴 HIGH | Test all features, verify settings migration |

### Medium Risk Areas

| Area | Risk Level | Mitigation |
|------|-----------|------------|
| UI text changes | 🟡 MEDIUM | Visual inspection, user feedback |
| Documentation | 🟡 MEDIUM | Peer review, link checking |
| File renames | 🟡 MEDIUM | Use git mv, verify no references |

### Low Risk Areas

| Area | Risk Level | Mitigation |
|------|-----------|------------|
| Comments | 🟢 LOW | Code review |
| Metadata tags | 🟢 LOW | Validation script |
| Directory renames | 🟢 LOW | No code dependencies |

### Risk Mitigation Strategies

1. **Phased Rollout:**
   - Release to beta testers first
   - Monitor for issues 48-72 hours
   - Full release after validation

2. **Comprehensive Testing:**
   - Test on multiple browsers
   - Test with different language settings
   - Test with fresh installs and upgrades

3. **Clear Documentation:**
   - Document all breaking changes
   - Provide migration guides
   - Create FAQ for common issues

4. **Quick Rollback:**
   - Keep old versions accessible
   - Tag release points
   - Have rollback procedure ready

5. **User Communication:**
   - Announce changes in advance
   - Provide update notes
   - Monitor user feedback channels

---

## EXECUTION CHECKLIST

### Pre-Execution

- [ ] Read entire refactoring plan
- [ ] Understand all breaking changes
- [ ] Prepare testing environment
- [ ] Create tracking spreadsheet
- [ ] Back up repository
- [ ] Create feature branch
- [ ] Allocate sufficient time (2-3 days minimum)

### During Execution

- [ ] Work through phases sequentially
- [ ] Test after each critical change
- [ ] Commit frequently with clear messages
- [ ] Document any deviations from plan
- [ ] Take breaks to maintain focus
- [ ] Ask for review on breaking changes

### Post-Execution

- [ ] Run validation script
- [ ] Complete all manual testing
- [ ] Update all documentation
- [ ] Create pull request with detailed description
- [ ] Get peer review
- [ ] Merge to main branch
- [ ] Create release tag
- [ ] Publish updates to Greasy Fork
- [ ] Monitor for issues

---

## ESTIMATED TIMELINE

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Preparation | 4-6 hours | 6 hours |
| Phase 1: Safe Changes | 6-8 hours | 14 hours |
| Phase 2: Critical Changes | 4-6 hours | 20 hours |
| Phase 3: Restructuring | 2-3 hours | 23 hours |
| Phase 4: Testing | 4-6 hours | 29 hours |
| Phase 5: Documentation | 2-3 hours | 32 hours |

**Total Estimated Time:** 28-32 hours (3.5-4 full work days)

**Recommended Schedule:**
- Day 1: Phase 0 + Phase 1 (prepare and safe changes)
- Day 2: Phase 2 (critical changes with intensive testing)
- Day 3: Phase 3 + Phase 4 (restructure and test)
- Day 4: Phase 5 + Final validation

---

## SUCCESS CRITERIA

The refactoring is considered successful when:

- [ ] ✅ Zero Chinese characters in any .js files
- [ ] ✅ Zero Chinese characters in any .md files
- [ ] ✅ Zero Chinese characters in directory names
- [ ] ✅ Zero Chinese characters in filenames
- [ ] ✅ All validation scripts pass
- [ ] ✅ All critical scripts tested and working
- [ ] ✅ Keylol Helper settings migration verified
- [ ] ✅ All documentation updated
- [ ] ✅ CHANGELOG created
- [ ] ✅ No regression in unmodified scripts
- [ ] ✅ Git history preserved
- [ ] ✅ Peer review completed
- [ ] ✅ Published to Greasy Fork (if applicable)
- [ ] ✅ No critical issues reported within 7 days

---

## NOTES

### Important Reminders

1. **DO NOT rush through critical changes** - Take time to test thoroughly
2. **Keep communication open** - Document unexpected issues
3. **Preserve git history** - Use git mv for renames
4. **Test with real accounts** - Don't rely on assumptions
5. **Have rollback ready** - Things can go wrong
6. **Get second opinion** - Especially on translations

### Questions to Resolve

Before starting, answer these:

1. [ ] Should bilingual documentation remain or English-only?
2. [ ] Should we keep Chinese text for website UI matching?
3. [ ] What's the strategy for Chinese-only websites?
4. [ ] Should we notify users before releasing?
5. [ ] What's the versioning scheme for this major change?
6. [ ] Who will do final review?

---

**END OF REFACTORING PLAN**
