import { styleTags } from "../consts/styles.js";

const template = document.createElement("template");

template.innerHTML = `
${styleTags}
<style>
    .card{
        display: flex;
        gap: 8px;
        flex-direction: row;
        align-items: stretch;
    }

    img{
        width: 124px;
        height: 124px;
        object-fit: cover;
    }

    .container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .track-info{
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .track-info .track{
        font-size: 1.2rem;
        margin:0;
        text-overflow: ellipsis
    }
    .track-info .artist{
        font-size: 1rem;
        margin:0;
        text-overflow: ellipsis
    }

    .controls{
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
    }

    .controls .icon-button{
        font-size: 32px;
    }

    .controls .icon-button#play-pause{
        font-size: 48px;
    }
</style>
<div class="card">
    <img src="https://images.genius.com/bcd2aca59efcbefe872757c7412a475f.1000x1000x1.jpg"/>
    <div class="container">
        <div class="track-info">
            <p class="track">Supercut</p>
            <p class="artist">Lorde</p>
        </div>
        <div class="controls">
            <button class="icon-button" id="previous">
                <i class="fa-solid fa-backward-step"></i>
            </button>
            <button class="icon-button" id="play-pause">
                <i class="fa-solid fa-play"></i>
            </button>
            <button class="icon-button" id="next">
                <i class="fa-solid fa-forward-step"></i>
            </button>
        </div>
    </div>
</div>
`;

class SpotifyWidget extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: "open",
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("click", (event) => {
      if (["BUTTON", "I"].includes(event.target.tagName)) return;
      this.openSpotify();
    });
  }

  openSpotify() {
    window.location = `app://com.spotify.music`;
  }
}

window.customElements.define("spotify-widget", SpotifyWidget);
