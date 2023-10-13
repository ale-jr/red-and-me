import { styleTags } from "../consts/styles.js";
import { openWazeLink } from "../services/wazeService.js";

const template = document.createElement("template");

template.innerHTML = `
${styleTags}
<style>

  
button {
  all: unset;
  width: 100%;
  cursor: pointer;
}

button:active,
button:hover {
  color: var(--text-800);
}

li {
  margin-bottom: 0.75rem;
}

li {
  width: 100%;
  list-style-type: none;
  font-size: 1.4rem;
}
</style>
<li>
    <button>
        <i class="fa-solid fa-house"></i> <span></span>
    </button>
</li>
`;

class NavigationItem extends HTMLElement {
  latitude = 0;
  longitude = 0;
  icon = "";
  title = "";

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: "open",
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.querySelector("button").addEventListener("click", () => {
      openWazeLink(this.latitude, this.longitude);
    });
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    this[name] = newValue;
    this.shadowRoot.querySelector("i").className = this.icon;
    this.shadowRoot.querySelector("span").innerText = this.title;
  }

  static get observedAttributes() {
    return ["title", "latitude", "longitude", "icon"];
  }
}

window.customElements.define("navigation-item", NavigationItem);

