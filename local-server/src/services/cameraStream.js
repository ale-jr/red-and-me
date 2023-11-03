import { spawn, execSync } from "child_process";
import { consts } from "../consts/index.js";

export const createCameraStream = () => {
  const start = async () => {
    //Remove old chrome locks
    try {
      execSync(`rm -rf ${consts.CHROMIUM_LOCK_FILE_PATH}`);
    } catch (e) {}

    const chromeCommand = spawn(consts.CHROMIUM_PATH, [
      "--use-fake-ui-for-media-stream",
      "--no-sandbox",
      "--headless=new",
      "--remote-debugging-port=9223",
      `http://localhost:${consts.SERVER_PORT}/camera-stream`,
    ]);
    chromeCommand.stdout.on("data", (data) => {
      console.log(`[CHROME]: ${data}`);
    });

    chromeCommand.stderr.on("data", (data) => {
      console.error(`[CHROME ERROR]: ${data}`);
    });

    chromeCommand.on("close", (code) => {
      console.log(`[CHOME EXIT] code: ${code}`);
    });
  };

  return {
    start,
  };
};

export const cameraStream = createCameraStream();
