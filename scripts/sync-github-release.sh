#!/usr/bin/env bash
# ==============================================================================
# sync-github-release.sh
# 
# 一键将本地生成的 10 个 rust-daed v3.1.2 发行包同步上传到 GitHub Releases
# ==============================================================================
set -euo pipefail

REPO="Quan-0505/rust-daed"
TAG="v3.1.2"
PKG_DIR="/tmp/pkg"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "❌ 错误: 未检测到 GITHUB_TOKEN 环境变量！"
  echo ""
  echo "使用方法："
  echo "  export GITHUB_TOKEN=\"ghp_xxxxxxxxxxxxxxxxxxxx\""
  echo "  bash ./scripts/sync-github-release.sh"
  echo ""
  echo "或者使用 gh 命令行工具在本地直接上传："
  echo "  gh release upload $TAG $PKG_DIR/rust-daed_3.1.2* $PKG_DIR/checksums.txt --clobber --repo $REPO"
  exit 1
fi

echo "🔍 正在检查 GitHub 仓库 $REPO 上的 Release $TAG..."
RELEASE_JSON=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$REPO/releases/tags/$TAG")

RELEASE_ID=$(echo "$RELEASE_JSON" | grep -m1 '"id":' | tr -dc '0-9')

if [ -z "$RELEASE_ID" ]; then
  echo "❌ 未在 GitHub 上找到标签为 $TAG 的 Release！"
  exit 1
fi

echo "✅ 找到 Release ID: $RELEASE_ID"

# 检查包文件是否存在，如果不存在则调用打包脚本
if [ ! -f "$PKG_DIR/rust-daed_3.1.2-linux-x86_64_v2_sse.deb" ]; then
  echo "📦 本地包文件缺失，正在执行 ./scripts/package-release.sh..."
  bash ./scripts/package-release.sh
fi

echo ""
echo "🚀 开始上传 10 个发布资产至 GitHub..."

for file in "$PKG_DIR"/rust-daed_3.1.2* "$PKG_DIR"/checksums.txt; do
  [ -e "$file" ] || continue
  filename=$(basename "$file")
  echo -n "  ⬆️ 上传 $filename ... "

  # 检查是否已存在同名资产，如果存在则先删除
  ASSET_ID=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO/releases/$RELEASE_ID/assets" \
    | grep -B 2 "\"name\": \"$filename\"" | grep '"id":' | head -n 1 | tr -dc '0-9' || true)

  if [ -n "$ASSET_ID" ]; then
    curl -s -X DELETE -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$REPO/releases/assets/$ASSET_ID" > /dev/null
    echo -n "(已覆盖旧文件) "
  fi

  # 上传新资产
  curl -s -X POST \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @"$file" \
    "https://uploads.github.com/repos/$REPO/releases/$RELEASE_ID/assets?name=$filename" > /dev/null

  echo "✅ 成功"
done

echo ""
echo "🎉 全部 10 个发行包及 checksums.txt 已成功上传至 https://github.com/$REPO/releases/tag/$TAG ！"
