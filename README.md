# 构建与数据工具

## 环境

- Node.js 24（当前验证环境）
- npm
- Python 3（仅 `tools/compress_json.py` / `tools/decompress_json.py` 需要）

安装依赖：

```sh
npm install
```

## Webpack 构建

生产构建：

```sh
npm run build
```

启动 `dist` 本地服务器并监听文件变化：

```sh
npm run server
```

格式化 / ESLint 自动修复：

```sh
npm run format
```

## 统一字符数据构建

Seeker 与 ziSrc 的数据由同一入口生成：

```sh
node tools/build-han-data.mjs
```

忽略缓存并重新下载上游：

```sh
node tools/build-han-data.mjs --refresh
```

当前固定数据源：

| 数据 | 来源 | 固定版本 |
| --- | --- | --- |
| 汉字 IDS | `yi-bai/ids` | `267e3fb5d0a32de63128e67ef2f329277cc4013c` |
| 西夏文 IDS | `JLHwung/TangutIDS` | `48fe86dc86f30e7862983e4f4f92a75d0a07f6b3` |
| Unihan / IRG Source | Unicode UCD | `18.0.0` |
| 8105 字表 | `src/data/seeker/standard-8105.txt` | 仓库固定输入 |

`JLHwung/TangutIDS` 的固定版本声明数据更新到 Unicode 17。该仓库当前没有 LICENSE 文件；公开再分发由其数据生成的数据库前应确认上游许可条件。

### 指定上游版本

```sh
node tools/build-han-data.mjs \
  --unicode=18.0.0 \
  --ids-commit=267e3fb5d0a32de63128e67ef2f329277cc4013c \
  --tangut-commit=48fe86dc86f30e7862983e4f4f92a75d0a07f6b3
```

`--commit=` 是 `--ids-commit=` 的别名。

### 离线构建

已有 `yi-bai/ids` 文件与 `TangutIDS.txt`：

```sh
node tools/build-han-data.mjs \
  --source-dir=./local/yi-bai-ids \
  --tangut-file=./local/TangutIDS.txt \
  --unihan-zip=./local/Unihan.zip
```

也可以让西夏数据从目录读取：

```sh
node tools/build-han-data.mjs \
  --tangut-source-dir=./local/TangutIDS \
  --unihan-file=./local/Unihan_IRGSources.txt
```

`--source-dir` 目录需要包含：

```text
ids_lv1.txt
ids_lv2.txt
```

`--tangut-source-dir` 目录需要包含：

```text
TangutIDS.txt
```

### 生成文件

统一构建会更新：

```text
src/data/seeker/yiids.seekerdb
src/data/seeker/yiids.metadata.json
src/data/zisrc/irg-sources.zisrcdb
src/data/zisrc/irg-sources.metadata.json
```

缓存目录：

```text
.han-data-cache/
```

该目录已由 `.gitignore` 忽略。

## 单独构建 Seeker 数据

```sh
node tools/build-seeker-db.mjs
```

常用参数：

```text
--refresh
--unicode=<version>
--ids-commit=<sha>
--commit=<sha>
--source-dir=<directory>
--tangut-commit=<sha>
--tangut-source-dir=<directory>
--tangut-file=<file>
--standard=<file>
--output=<file>
--metadata=<file>
--cache-dir=<directory>
--tangut-cache-dir=<directory>
--allow-small
```

Seeker 数据构建内容：

- `yi-bai/ids` lv1 / lv2 汉字 IDS
- `JLHwung/TangutIDS` 西夏文 IDS
- direct character postings
- direct branch postings
- recursive branch postings
- 8105 bitset

`src/js/seeker/keyboard.js` 是固定人工部件键盘数据，不参与自动生成。

## 单独构建 ziSrc 数据

```sh
node tools/build-zisrc-db.mjs
```

常用参数：

```text
--refresh
--unicode=<version>
--unihan-url=<url>
--unihan-zip=<file>
--unihan-file=<file>
--unicode-license=<file-or-url>
--output=<file>
--metadata=<file>
--cache-dir=<directory>
--allow-small
```

默认从 Unicode `Unihan.zip` 中读取 `Unihan_IRGSources.txt`，生成字符到 IRG Source 与反向 Source posting 数据。

## 数据配置

统一版本与上游固定值位于：

```text
tools/han-data.config.mjs
```

修改 Unicode、`yi-bai/ids` 或 TangutIDS 固定版本后，重新执行：

```sh
node tools/build-han-data.mjs --refresh
npm run build
```

## GitHub Pages 部署

只生成部署内容、不推送：

```sh
npm run deploy:github-pages:dry
```

生成并推送 GitHub Pages：

```sh
npm run deploy:github-pages
```

对应工具：

```text
tools/deploy-github-pages.mjs
```

## JSON 压缩辅助工具

压缩 JSON / MessagePack + zlib：

```sh
python tools/compress_json.py <input> <output>
```

解压：

```sh
python tools/decompress_json.py <input> <output>
```
