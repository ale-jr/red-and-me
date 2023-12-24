import { DEFAULT_CAMERA_SETTINGS } from "../consts/camera.js";
import { styleTags } from "../consts/styles.js";

const template = document.createElement("template");

template.innerHTML = `
    ${styleTags}
    <style>
        .modal-body{
            display: flex;
            flex-direction:column;
            gap: 16px;
            overflow: auto;
        }

        .section {
          margin: 12px 0 0 0 ;
          font-size: 18px;
        }
    </style>
    <div class="backdrop hidden"></div>
    <div class="modal hidden">
        <button class="modal-close">&times;</button>
        <h1 class="modal-header">
            Settings
        </h1>
        <div class="modal-body">
            <label>
                Cloud token <br/>
                <input type="password" id="token-input" />
            </label>
            <label>
                <input type="checkbox" id="dark-mode-checkbox" />
                Dark mode
            </label>
            <p class="section">Camera settings</p>
            <label>
                height<br/>
                <input type="number" min="0" id="camera-height-input" />
            </label>
            <label>
                width<br/>
                <input type="number" min="0" id="camera-width-input" />
            </label>
            <label>
                scale<br/>
                <input type="number" min="1" step="0.25" id="camera-scale-input" />
            </label>
            <label>
                x<br/>
                <input type="number" min="0" step="1" id="camera-x-input" />
            </label>
            <label>
                y<br/>
                <input type="number" min="0" step="1" id="camera-y-input" />
            </label>
            <label>
                rotate<br/>
                <input type="number"  step="1" id="camera-rotate-input" />
            </label>
        </div>
        <div class="modal-footer">
            <button id="save-settings">Salvar</button>
        </div>
    </div>



`;

class SettingsModal extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: "open",
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.host.addEventListener("open", () => {
      this.shadowRoot.querySelector(".modal").classList.remove("hidden");
      this.shadowRoot.querySelector(".backdrop").classList.remove("hidden");
    });

    this.shadowRoot
      .querySelector(".modal-close")
      .addEventListener("click", () => this.closeModal());

    this.shadowRoot
      .querySelector(".backdrop")
      .addEventListener("click", () => this.closeModal());

    this.shadowRoot.querySelector("#dark-mode-checkbox").checked =
      localStorage.getItem("theme") === "dark";

    this.shadowRoot.querySelector("#token-input").value =
      localStorage.getItem("credentials");

    const cameraSettings =
      JSON.parse(localStorage.getItem("camera-settings") || "null") ||
      DEFAULT_CAMERA_SETTINGS;
    this.shadowRoot.querySelector("#camera-height-input").value =
      cameraSettings.height;
    this.shadowRoot.querySelector("#camera-width-input").value =
      cameraSettings.width;
    this.shadowRoot.querySelector("#camera-scale-input").value =
      cameraSettings.scale;

    this.shadowRoot.querySelector("#camera-x-input").value = cameraSettings.x;
    this.shadowRoot.querySelector("#camera-y-input").value = cameraSettings.y;
    this.shadowRoot.querySelector("#camera-rotate-input").value =
      cameraSettings.rotate;
    this.shadowRoot
      .querySelector("#save-settings")
      .addEventListener("click", () => {
        this.save();
      });

    this.updateTheme();
  }

  closeModal() {
    this.shadowRoot.querySelector(".modal").classList.add("hidden");
    this.shadowRoot.querySelector(".backdrop").classList.add("hidden");
  }

  updateTheme() {
    document.documentElement.setAttribute(
      "data-theme",
      localStorage.getItem("theme") || "light"
    );
  }

  save() {
    const token = this.shadowRoot.querySelector("#token-input").value;
    localStorage.setItem("credentials", token);

    const theme = this.shadowRoot.querySelector("#dark-mode-checkbox").checked
      ? "dark"
      : "light";
    localStorage.setItem("theme", theme);

    const height = +this.shadowRoot.querySelector("#camera-height-input").value;
    const width = +this.shadowRoot.querySelector("#camera-width-input").value;
    const scale = +this.shadowRoot.querySelector("#camera-scale-input").value;
    const x = +this.shadowRoot.querySelector("#camera-x-input").value;
    const y = +this.shadowRoot.querySelector("#camera-y-input").value;
    const rotate = +this.shadowRoot.querySelector("#camera-rotate-input").value;
    localStorage.setItem(
      "camera-settings",
      JSON.stringify({
        height,
        width,
        scale,
        x,
        y,
        rotate,
      })
    );

    this.updateTheme();
    this.closeModal();
  }
}

window.customElements.define("settings-modal", SettingsModal);
