import { styleTags } from "../../consts/styles.js";
import "./RoutePlanningTab.js";
import "./FavoritesTab.js";
import { openWazeLink } from "../../services/wazeService.js";
const template = document.createElement("template");

template.innerHTML = `
${styleTags}
<style>
    #navigation-card{
        flex-grow:1;
        height: 0px;
    }

    .card{
        justify-content: flex-start;
    }

    .tab{
        flex-grow: 1;
        overflow: auto;
        width: 100%;
    }

    .card-title {
        display:flex;
        align-items: center;
    }
    .card-title .text{
        flex-grow: 1;
    }
</style>
<section class="card" id="navigation-card">
    <p class="card-title">
        <i class="fa-brands fa-waze"></i>
        <span class="text">Navegação </span>
    </p>
    <div class="pills">
        <button data-tab="route-planning-tab" class="pill active">
            Percursos planejados
        </button>
        <button data-tab="favorite-tab" class="pill">
            Favoritos
        </button>
    </div>

    <route-planning-tab data-tab id="route-planning-tab" class="tab"></route-planning-tab>
    <favorites-tab  data-tab id="favorite-tab" class="tab"></favorites-ta>
    <div data-tab id="favorite-tab" class="tab">

</section>
`;

const TAB_KEY = "navigation-tab-id";
class NavigationWidget extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: "open",
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.selectTab(localStorage.getItem(TAB_KEY) || "favorite-tab");
    this.shadowRoot.querySelectorAll("button[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        this.selectTab(button.getAttribute("data-tab"));
      });
    });

    this.shadowRoot
      .querySelector("p.card-title")
      .addEventListener("click", () => {
        openWazeLink();
      });
  }

  selectTab(tabId) {
    this.shadowRoot.querySelectorAll(".tab[data-tab]").forEach((tab) => {
      if (tab.id === tabId) {
        if (typeof tab.updateItems === "function") {
          tab.updateItems();
        }
        tab.classList.remove("hidden");
      } else {
        tab.classList.add("hidden");
      }
    });

    this.shadowRoot.querySelectorAll("button[data-tab]").forEach((button) => {
      if (button.getAttribute("data-tab") === tabId) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });

    localStorage.setItem(TAB_KEY, tabId);
  }
}

window.customElements.define("navigation-widget", NavigationWidget);
