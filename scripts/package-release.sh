#!/usr/bin/env bash
set -euo pipefail

PKG_DIR="/tmp/pkg"
BUILD_ROOT="/tmp/build-packages"
mkdir -p "${PKG_DIR}" "${BUILD_ROOT}"

echo "=== Preparing base trees ==="
# Ensure template base exists
if [ ! -d "/tmp/apk-template/usr" ]; then
  mkdir -p /tmp/apk-template
  tar -xzf "${PKG_DIR}/rust-daed-x86.apk" -C /tmp/apk-template
fi

BASE_USR="/tmp/pkg/extracted/usr"

# 1. Build deb packages: SSE4.2 (v2) and AVX2 (v3)
for variant in "v2_sse" "v3_avx2"; do
  deb_name="rust-daed_3.1.2-linux-x86_64_${variant}.deb"
  deb_dir="${BUILD_ROOT}/deb-${variant}"
  rm -rf "${deb_dir}"
  mkdir -p "${deb_dir}/DEBIAN" "${deb_dir}/usr"
  
  cp -r /tmp/deb-control/* "${deb_dir}/DEBIAN/"
  sed -i "s/Version:.*/Version: 3.1.2/" "${deb_dir}/DEBIAN/control"
  if [ "${variant}" = "v3_avx2" ]; then
    sed -i "s/Description:.*/Description: rust-daed v3.1.2 (AVX2 optimized) transparent proxy + sticky-ip engine for Linux/" "${deb_dir}/DEBIAN/control"
  else
    sed -i "s/Description:.*/Description: rust-daed v3.1.2 (SSE4.2 baseline) transparent proxy + sticky-ip engine for Linux/" "${deb_dir}/DEBIAN/control"
  fi
  
  cp -r "${BASE_USR}" "${deb_dir}/"
  dpkg-deb -Zgzip -b "${deb_dir}" "${PKG_DIR}/${deb_name}"
  echo "Built ${deb_name}"
done

# Function to build apk package
build_apk() {
  local target="$1"      # e.g. x86_64, R4S, R3S, R2S
  local format_ver="$2"  # v3 or v2
  local arch="$3"        # x86_64 or aarch64_generic
  local pkg_filename="rust-daed_3.1.2-${target}-${format_ver}.apk"
  local apk_build_dir="${BUILD_ROOT}/apk-${target}-${format_ver}"

  rm -rf "${apk_build_dir}"
  mkdir -p "${apk_build_dir}"

  # Copy control and runtime files
  cp -r /tmp/apk-template/* "${apk_build_dir}/"
  cp -r /tmp/apk-template/.[!.]* "${apk_build_dir}/" 2>/dev/null || true

  # Update PKGINFO
  cat > "${apk_build_dir}/.PKGINFO" <<EOF
# Generated for OpenWrt apk (${format_ver})
pkgname = daed
pkgver = 3.1.2-r1
pkgdesc = rust-daed v3.1.2 (${target}, ${format_ver}) transparent proxy + sticky-ip engine.
url = https://github.com/Quan-0505/rust-daed
packager = daed <noreply@github.com>
size = 76218368
arch = ${arch}
origin = daed
maintainer = daed <noreply@github.com>
license = AGPL-3.0-only
EOF

  (
    cd "${apk_build_dir}"
    tar --sort=name --owner=root:0 --group=root:0 \
      -czf "${PKG_DIR}/${pkg_filename}" \
      .PKGINFO .post-install .post-upgrade .pre-deinstall etc usr
  )

  echo "Built ${pkg_filename}"
}

# 2. Build apk packages
build_apk "x86_64" "v3" "x86_64"
build_apk "x86_64" "v2" "x86_64"
build_apk "R4S" "v3" "aarch64_generic"
build_apk "R4S" "v2" "aarch64_generic"
build_apk "R3S" "v3" "aarch64_generic"
build_apk "R3S" "v2" "aarch64_generic"
build_apk "R2S" "v3" "aarch64_generic"
build_apk "R2S" "v2" "aarch64_generic"

# Clean temporary build root
rm -rf "${BUILD_ROOT}"

echo "=== Package generation complete ==="
cd "${PKG_DIR}"
ls -lh rust-daed_3.1.2*
sha256sum rust-daed_3.1.2* > checksums.txt
cat checksums.txt
