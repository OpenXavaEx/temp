#! /bin/bash
if [ -z $BASH ]; then
    echo "This shell script MUST run under bash."
    exit -1
fi
_script="$(readlink -f "${BASH_SOURCE[0]}")"
_script_dir="$(dirname "$_script")"
echo "Directory of $_script : $_script_dir"

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

cp -Rv "${SIMULATOR_DIR}/" "${INSTALL_DIR}/"
cp -Rv "${DEVICE_DIR}/" "${INSTALL_DIR}/"

lipo -create "${DEVICE_DIR}/BKIM_ReactNative_Framework" "${SIMULATOR_DIR}/BKIM_ReactNative_Framework" -output "${INSTALL_DIR}/BKIM_ReactNative_Framework"
