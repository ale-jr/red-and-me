const createRearViewCameraStream = (processVideo) => {
  /**
   * @type {HTMLVideoElement}
   */
  const videoElement = document.getElementById("videoelement");

  /**
   * @type {HTMLCanvasElement}
   */
  const canvasElement = document.getElementById("canvaselement");

  const ctx = canvasElement.getContext("2d");

  let canvasInterval = null;

  const fps = 10;

  let isStreamming = false;

  /**
   * @type {MediaStream}
   */
  let webcamStream = null;

  /**
   * @type {MediaStream}
   */
  let canvasStream = null;

  const startStream = () => {
    if (isStreamming) return Promise.resolve(getStream());
    return navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { width: 1280, height: 720 },
      })
      .then((stream) => {
        webcamStream = stream;
        isStreamming = true;

        if (processVideo) {
          videoElement.srcObject = stream;
          videoElement.play();
          canvasInterval = setInterval(drawToCanvas, 1000 / fps);
          canvasStream = canvasElement.captureStream(fps);
        }

        return getStream();
      });
  };

  const drawToCanvas = () => {
    const zoom = window.zoom || 1.4;

    const newHeight = videoElement.videoHeight * zoom;
    const newWidth = videoElement.videoWidth * zoom;

    var x = canvasElement.width / 2 - newWidth / 2;
    var y = canvasElement.height / 2 - newHeight / 2;

    ctx.drawImage(videoElement, x, y, newWidth, newHeight);
  };

  const stopStream = () => {
    canvasStream?.getTracks().forEach((track) => track.stop());
    webcamStream?.getTracks().forEach((track) => track.stop());
    videoElement.srcObject = null;
    isStreamming = false;
    clearInterval(canvasInterval);
  };

  /**
   * @returns {MediaStream}
   */
  const getStream = () => (processVideo ? canvasStream : webcamStream);

  return {
    startStream,
    stopStream,
    getStream,
  };
};

export const rearViewCameraStream = createRearViewCameraStream(false);

window.rearViewCameraStream = rearViewCameraStream;
