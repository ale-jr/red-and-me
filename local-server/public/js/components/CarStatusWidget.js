import { styleTags } from "../consts/styles.js";

const template = document.createElement("template");

template.innerHTML = `
${styleTags}
<style>
    img{
        width: 400px;
    }

    .card{
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
<div class="card">
    <img src="assets/img/car.png"/>
</div>
`;

class CarStatusWidget extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: "open",
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

window.customElements.define("car-status-widget", CarStatusWidget);
