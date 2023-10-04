export const production = {
  SERVER_PORT: 3000,
  SERIAL_PORT_PATH: "/dev/ttyS5",
  CHROMIUM_PATH: "/usr/bin/chromium-browser",
  CHROMIUM_LOCK_FILE_PATH: "/root/snap/chromium/common/chromium/SingletonLock",
  ADB_PATH: "/root/adb",
  TABLET_ADDRESS: "192.168.201.101:9009",
  SHUTDOWN_COMMAND: 'shutdown -h now'
};
