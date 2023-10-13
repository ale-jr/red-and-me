import { styleTags } from "../../consts/styles.js";
import { request } from "../../services/apiService.js";
import { openWazeLink } from "../../services/wazeService.js";
import { CLOUD_SERVER_URL } from "../../consts/urls.js";

const template = document.createElement("template");

template.innerHTML = `
    ${styleTags}
    <style>
        #offline{
            width: 100%;
            display: flex;
            flex-direction:column;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            margin-top: 2rem;
        }

        #offline h1{
            margin: 0;
        }

        #offline .spin-icon {
            font-size: 2rem;
        }
    </style>
    <ul></ul>
    <div id="offline">
        <h1>Aguardando rede</h1>
        <i class="fa-solid fa-circle-notch fa-spin fa-lg spin-icon"></i>
        <label><input  id="start-route-checkbox" type="checkbox"/> Iniciar rota automaticamente</label>
    </div>
`;

class RoutePlanningTab extends HTMLElement {
  updateTimeoutId = null;
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: "open",
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.startUpdating();
  }

  disconnectedCallback() {
    clearTimeout(this.updateTimeoutId);
  }

  startUpdating() {
    this.updateItems().then((success) => {
      this.updateTimeoutId = setTimeout(
        () => {
          this.startUpdating();
        },
        success ? 30_000 : 5_000
      );
    });
  }

  updateItems() {
    const offlineEl = this.shadowRoot.querySelector("#offline");

    const ulEl = this.shadowRoot.querySelector("ul");
    return request({
      url: `${CLOUD_SERVER_URL}route-plannings`,
      method: "GET",
    })
      .then((items) => {
        ulEl.innerHTML = "";
        ulEl.classList.remove("hidden");
        offlineEl.classList.add("hidden");
        items.forEach(({ completed, ...item }) => {
          const navigation = document.createElement("navigation-item");
          Object.entries(item).forEach(([key, value]) =>
            navigation.setAttribute(key, value)
          );

          navigation.setAttribute(
            "icon",
            completed ? "fa-solid fa-check" : "fa-regular fa-compass"
          );

          navigation.addEventListener("click", () => {
            this.completeRoute(item.id);
          });
          ulEl.append(navigation);
        });

        const checkEl = this.shadowRoot.querySelector("#start-route-checkbox");

        if (checkEl.checked) {
          const firstElement = items.find((item) => !item.completed);
          if (firstElement) {
            this.completeRoute(firstElement.id).then(() => {
              checkEl.checked = false;
              openWazeLink(firstElement.latitude, firstElement.longitude);
            });
          }
        }

        return true;
      })
      .catch((e) => {
        console.error(e);
        ulEl.classList.add("hidden");
        offlineEl.classList.remove("hidden");
        return false;
      });
  }

  completeRoute(id) {
    return request({
      url: `${CLOUD_SERVER_URL}route-plannings/complete/${id}`,
      method: "POST",
    });
  }
}

window.customElements.define("route-planning-tab", RoutePlanningTab);
