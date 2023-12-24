import { WS_MESSAGE } from "../consts/events.js";
import { styleTags } from "../consts/styles.js";
import { LOCAL_SERVER_HTTP_URL } from "../consts/urls.js";
import { request } from "../services/apiService.js";
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

    .dashboard{
      display: flex;
      width: 80%;
      justify-content: space-around;
    }

    .dashboard img{
      width: 80px;
    }

    .transmission{
      text-align: center;
      padding: 0 16px;
    }

    .transmission .gear{
      margin: 0.5rem 0 0;
      font-size: 2.5rem;
      font-weight: 900;
    }
    .transmission .mode{
      margin: 0rem 0 0;
      font-size: 1rem;
    }

    .card-warning{
      margin-bottom: 12px;
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;
      justify-content: start;
    }

    .card-warning i{
      font-size: 2rem;
    }

    .card-warning p{
      margin: 0.3rem 0;
      font-size: 1.3rem;
      font-weight: 600;
    }
</style>
<div id="warning-card" class="card card-warning" style="display:none">
<i class="fa-solid fa-triangle-exclamation"></i> <div>
 <p id="warning-passenger-door">Porta do passageiro aberta</p>
 <p id="warning-driver-door">Porta do motorista aberta</p>
 <p id="warning-trunk">Porta malas aberto</p>
 </div>
</div>

<div class="card">
    <div class="dashboard">
      <img id="left-turn-signal" src="assets/img/left-turn-signal.svg"/>
      <img id="high-beam" src="assets/img/high-beam.svg"/>
      <div class="transmission">
        <p id="gear" class="gear">N</p>
        <p id="mode" class="mode">auto</p>
      </div>
      <img id="low-beam" src="assets/img/position-light.svg"/>
      <img id="right-turn-signal" src="assets/img/right-turn-signal.svg"/>
    </div>

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

  updateVisitility = (id, visible, useVisibility) => {

    if (useVisibility)
      this.shadowRoot.getElementById(id).style.visibility = visible ? 'visible' : 'hidden'
    else
      this.shadowRoot.getElementById(id).style.display = visible ? 'block' : 'none'
  }

  connectedCallback() {
    document.addEventListener(WS_MESSAGE, (event) => {

      const message = event.detail

      if (message.type === "stateChange") {
        this.handleStateChange(message.state)
      }
    })


    request({
      url: window.location.origin.includes("file") ? `${LOCAL_SERVER_HTTP_URL}/state` : `/state`,
      method: 'GET'
    })
      .then((state) => {
        this.handleStateChange(state)
      })


  }

  handleStateChange = ({ lights, transmission, doors }) => {

    this.updateVisitility('left-turn-signal', lights.leftTurnSignal, true)
    this.updateVisitility('right-turn-signal', lights.rightTurnSignal, true)
    this.updateVisitility('high-beam', lights.highBeam, true)
    this.updateVisitility('low-beam', lights.lowBeam, true)

    const hasOpenDoors = doors.driver || doors.passenger || doors.trunk
    if (hasOpenDoors) {
      this.updateVisitility('warning-passenger-door', doors.passenger, false)
      this.updateVisitility('warning-driver-door', doors.driver, false)
      this.updateVisitility('warning-trunk', doors.trunk, false)


    }
    this.updateVisitility('warning-card', hasOpenDoors, false)

    this.shadowRoot.querySelector('#mode').innerText = transmission.manual ? 'manual' : 'auto'
    this.shadowRoot.querySelector('#gear').innerText = transmission.gear > 0 ? transmission.gear : transmission.gear === 0 ? 'N' : 'R'

  }



}

window.customElements.define("car-status-widget", CarStatusWidget);
