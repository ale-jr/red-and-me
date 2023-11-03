import { WS_MESSAGE, WS_SEND_MESSAGE } from "../consts/events.js";
import { styleTags } from "../consts/styles.js";
import { LOG_LEVEL, log } from "../services/log.js";
import { createWebRTCReceiver } from "../services/webrtcReceiver.js";

const template = document.createElement("template");

template.innerHTML = `
${styleTags}
<style>
  .camera-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.75);
    background-color: var(--card-bg);
    padding: 8px;
  }

  .camera-modal .close {
    all: unset;
    color: #ffffff;
    font-size: 2rem;
    font-weight: bolder;
    position: fixed;
    top: -1rem;
    right: -1rem;
  }

  .backdrop {
    background-color: var(--card-bg);
    opacity: 0.9;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .closed {
    display: none;
  }

  #parking-card{
    width: 100%;
  }

  #camera-stream {
    max-height: 85vh;
    max-width: 90vw;
  }

  #camera-overlay {
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 8px;
    right: 8px;
  }
</style>
<button class="card card-button" id="parking-card">
    <i class="fa-solid fa-video"></i> Câmera de ré
</button>
<div class="backdrop closed"></div>
<div class="camera-modal closed">
    <button class="close">&times;</button>
    <video autoplay id="camera-stream"></video>
    <canvas id="camera-overlay"></canvas>
</div>
</div>
`;

class CameraWidget extends HTMLElement {
  /**
   * @type {import("../services/webrtcReceiver.js").WebRTCReceiver}
   */
  webRtcReceiver = null;
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: "open",
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    this.webRtcReceiver = createWebRTCReceiver({
      onStream: (stream) => this.onStream(stream),
      sendMessage: (data) => {
        const event = new CustomEvent(WS_SEND_MESSAGE, {
          detail: data,
        });
        document.dispatchEvent(event);
      },
    });

    document.addEventListener(WS_MESSAGE, (event) => {
      const message = event.detail;

      switch (message.type) {
        case "camera-stream-reply":
          this.webRtcReceiver.handleStreamRequestReply(
            message.payload,
            message.connectionId
          );
          break;
        case "show-camera-stream":
          this.showCamera();
          break;
        case "close-camera-stream":
          this.closeCamera();
          break;
      }
    });
  }

  connectedCallback() {
    this.shadowRoot
      .querySelector("#parking-card")
      .addEventListener("click", () => this.showCamera());

    this.shadowRoot
      .querySelector(".close")
      .addEventListener("click", () => this.closeCamera());

    this.shadowRoot
      .querySelector(".backdrop")
      .addEventListener("click", () => this.closeCamera());
  }

  /**
   *
   * @param {MediaStream} stream
   */
  onStream(stream) {
    /**
     * @type {HTMLVideoElement}
     */
    const videoElement = this.shadowRoot.querySelector("#camera-stream");
    videoElement.srcObject = stream;

    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = this.shadowRoot.querySelector("#camera-overlay");

    // setTimeout(() => {
    //   canvas.width = videoElement.clientWidth;
    //   canvas.height = videoElement.clientHeight;

    //   const ctx = canvas.getContext("2d");

    //   ctx.strokeStyle = "red";
    //   ctx.lineWidth = 3;
    //   ctx.beginPath();
    //   ctx.moveTo(0, 0);

    //   ctx.lineTo(100, 100);
    //   ctx.stroke();
    // }, 100);
  }

  showCamera() {
    this.webRtcReceiver.requestStream();
    this.shadowRoot.querySelector(".backdrop").classList.remove("closed");
    this.shadowRoot.querySelector(".camera-modal").classList.remove("closed");
  }

  closeCamera() {
    this.shadowRoot.querySelector(".backdrop").classList.add("closed");
    this.shadowRoot.querySelector(".camera-modal").classList.add("closed");
    this.webRtcReceiver.closeAllConnections();
  }
}

window.customElements.define("camera-widget", CameraWidget);
