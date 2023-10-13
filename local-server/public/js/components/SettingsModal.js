import { styleTags } from "../consts/styles.js";

const template = document.createElement("template");

template.innerHTML = `
    ${styleTags}
    <style>
        .modal-body{
            display: flex;
            flex-direction:column;
            gap: 16px;
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
    const theme = this.shadowRoot.querySelector("#dark-mode-checkbox").checked
      ? "dark"
      : "light";

    localStorage.setItem("credentials", token);
    localStorage.setItem("theme", theme);
    this.updateTheme();
    this.closeModal();
  }
}

window.customElements.define("settings-modal", SettingsModal);
