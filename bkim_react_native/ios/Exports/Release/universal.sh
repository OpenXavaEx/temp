#! /bin/bash
if [ -z $BASH ]; then
    echo "This shell script MUST run under bash."
    exit -1
fi
_script_dir=$(cd "$(dirname "$0")"; pwd)
echo "Directory of $0 : $_script_dir"

set -o nounset
set -o errexit

INSTALL_DIR=${_script_dir}/universal/BKIM_ReactNative_Framework.framework
DEVICE_DIR=${_script_dir}/PLAT-iphoneos/BKIM_ReactNative_Framework.framework
SIMULATOR_DIR=${_script_dir}/PLAT-iphonesimulator/BKIM_ReactNative_Framework.framework

if [ -d "${INSTALL_DIR}" ]
then
   rm -rf "${INSTALL_DIR}"
fi
mkdir -p "${INSTALL_DIR}"

set -x

cp -R "${SIMULATOR_DIR}/" "${INSTALL_DIR}/"
lipo -detailed_info "${INSTALL_DIR}/BKIM_ReactNative_Framework"
cp -R "${DEVICE_DIR}/" "${INSTALL_DIR}/"
lipo -detailed_info "${INSTALL_DIR}/BKIM_ReactNative_Framework"

lipo -create "${DEVICE_DIR}/BKIM_ReactNative_Framework" "${SIMULATOR_DIR}/BKIM_ReactNative_Framework" -output "${INSTALL_DIR}/BKIM_ReactNative_Framework"
lipo -detailed_info "${INSTALL_DIR}/BKIM_ReactNative_Framework"
