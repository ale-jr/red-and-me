import { navigation } from "../../consts/navigation.js";
import { styleTags } from "../../consts/styles.js";

const template = document.createElement("template");

template.innerHTML = `
${styleTags}
<ul>
</ul>
`;

class FavoritesTab extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: "open",
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const ul = this.shadowRoot.querySelector("ul");
    navigation.forEach((item) => {
      const navigationItem = document.createElement("navigation-item");
      Object.entries(item).forEach(([key, value]) =>
        navigationItem.setAttribute(key, value)
      );

      ul.append(navigationItem);
    });
  }
}

window.customElements.define("favorites-tab", FavoritesTab);
