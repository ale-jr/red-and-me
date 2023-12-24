import { DEFAULT_CAMERA_SETTINGS } from "../consts/camera.js";
import { WS_MESSAGE, WS_SEND_MESSAGE } from "../consts/events.js";
import { styleTags } from "../consts/styles.js";
import { LOG_LEVEL, log } from "../services/log.js";
import { createWebRTCReceiver } from "../services/webrtcReceiver.js";

const template = document.createElement("template");

const THRESHOLDS = {
  WARNING: 50,
  DANGER: 20
}

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
    padding: 16px;
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content:space-between;

  }

  .camera-modal .close {
    all: unset;
    color: #ffffff;
    font-size: 3.5rem;
    font-weight: bolder;
    position: fixed;
    top: 0rem;
    right: 0.5rem;
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



  .stage{
    position: relative; 
    overflow:hidden;
  }

  #camera-stream {
    position: absolute;
  }

  .sensors{

    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  } 

  .sensors .car, .sensors .sensor-values{
      width: 200px;
  }

  .sensors .sensor-values {
    display: flex;
    justify-content:center;
    gap: 44px;
    font-size: 32px;

  }

  .sensors .sensor-values small {
    font-size: 16px;
  }

  .sensors .sensor-values .warning{
    color: orange;
  }

  .sensors .sensor-values div {
    flex-grow:0;
    flex-shrink: 0;
    width: 80px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
  }
  .sensors .sensor-values .danger{
    color: red;
  }






</style>
<button class="card card-button" id="parking-card">
  <i class="fa-solid fa-car"></i> Park assist
</button>
<div class="backdrop closed"></div>
<div class="camera-modal closed">
    <button class="close">&times;</button>
    <div class="stage">
      <video autoplay id="camera-stream"></video>
    </div>
    <div class="sensors">
      <div class="sensor-values" id="front-sensors">
        <div class="warning"><span>300</span><small>cm</small></div>
        <div class="danger"><span>300</span><small>cm</small></div>
        <div><span>300</span><small>cm</small></div>
      </div>
      <img src="assets/img/car-top-view.png" class="car" />
      <div class="sensor-values" id="rear-sensors">
        <div><span>300</span><small>cm</small></div>
        <div><span>300</span><small>cm</small></div>
        <div><span>300</span><small>cm</small></div>
      </div>
    </div>
</div>
</div>
`;

class ParkingWidget extends HTMLElement {
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
        case "stateChange":
          const gear = message.state?.transmission?.gear
          if (gear === -1)
            this.showCamera();
          this.updateSensors(message.state.proximity)
          break;

      }
    });

  }

  updateSensors = ({ front, rear }) => {


    const applyLimits = (element, value) => {
      if (value <= THRESHOLDS.DANGER) {
        element.className = 'danger'
      }
      else if (value <= THRESHOLDS.WARNING) {
        element.className = 'warning'
      }
      else {
        element.className = ''
      }
      element.querySelector("span").innerText = value >= 999 ? '-' : value
    }

    this.shadowRoot.querySelector("#front-sensors").querySelectorAll("div").forEach((element, index) => {
      applyLimits(element, front[index])
    })

    this.shadowRoot.querySelector("#rear-sensors").querySelectorAll("div").forEach((element, index) => {
      applyLimits(element, rear[index])
    })

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

    this.updateCameraSettings();

    document.addEventListener('keyup', (e) => {
      if (e.key === "F2") {
        this.showCamera()
      }
    })
  }



  getSettings() {
    const cameraSettings =
      JSON.parse(localStorage.getItem("camera-settings") || "null") ||
      DEFAULT_CAMERA_SETTINGS;
    return cameraSettings;
  }

  updateCameraSettings() {
    const cameraSettings = this.getSettings();

    /**
     * @type {HTMLDivElement}
     */
    const stage = this.shadowRoot.querySelector(".stage");
    /**
     * @type {HTMLVideoElement}
     */
    const video = this.shadowRoot.querySelector("#camera-stream");

    stage.style.height = `${cameraSettings.height}px`;
    stage.style.width = `${cameraSettings.width}px`;


    video.width = cameraSettings.width;
    video.height = cameraSettings.height;

    video.style.height = `${cameraSettings.height}px`;
    video.style.width = `${cameraSettings.width}px`;

    video.style.transform = `scaleX(-1) scale(${cameraSettings.scale}) translateX(${cameraSettings.x}px) translateY(${cameraSettings.y}px) rotate(${cameraSettings.rotate}deg)`;
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

    this.updateCameraSettings();
  }

  showCamera() {
    this.webRtcReceiver.requestStream();
    this.shadowRoot.querySelector(".backdrop").classList.remove("closed");
    this.shadowRoot.querySelector(".camera-modal").classList.remove("closed");

    window.addEventListener("keyup", this.handleKey);
  }

  closeCamera() {
    this.shadowRoot.querySelector(".backdrop").classList.add("closed");
    this.shadowRoot.querySelector(".camera-modal").classList.add("closed");
    this.webRtcReceiver.closeAllConnections();

    window.removeEventListener("keyup", this.handleKey);
  }

  handleKey = (event) => {
    const command = event.key;

    const settings = this.getSettings();

    const positionAmount = event.ctrlKey ? 10 : 1;

    switch (command) {
      case "ArrowUp":
        settings.y = settings.y - positionAmount;
        break;
      case "ArrowDown":
        settings.y = settings.y + positionAmount;
        break;
      case "ArrowLeft":
        settings.x = settings.x - positionAmount;
        break;
      case "ArrowRight":
        settings.x = settings.x + positionAmount;
        break;
      case "+":
      case "=":
        settings.scale = settings.scale + 0.05;
        break;
      case "-":
        settings.scale = settings.scale - 0.05;
        break;
      case "9":
        settings.rotate = settings.rotate - 0.5;
        break;
      case "0":
        settings.rotate = settings.rotate + 0.5;
        break;
    }

    localStorage.setItem("camera-settings", JSON.stringify(settings));
    this.updateCameraSettings();
  };
}

window.customElements.define("parking-widget", ParkingWidget);
