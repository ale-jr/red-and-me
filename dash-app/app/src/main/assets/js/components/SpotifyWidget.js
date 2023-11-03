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

    .track-info #track{
        font-size: 1.2rem;
        margin:0;
        text-overflow: ellipsis
    }
    .track-info #artist{
        font-size: 1rem;
        margin:0;
        text-overflow: ellipsis
    }

    .controls{
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 53px;
    }

    .controls .icon-button{
        font-size: 42px;
    }

    .controls .icon-button#play-pause{
        font-size: 56px;
    }
</style>
<div class="card">
    <img id="cover" src="assets/img/spotify-logo.png"/>
    <div class="container">
        <div class="track-info">
            <p id="track">Spotify</p>
            <p id="artist"></p>
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
    this.shadowRoot.querySelector("#cover").addEventListener("click", (event) => {
      this.openSpotify();
    });

    window.addEventListener("message", (event) => {
      if (typeof event.data !== "string" || !event.data.includes("|")) return;
      const [type, value] = event.data.split("|");

      switch (type) {
        case "trackName":
          this.shadowRoot.querySelector("#track").innerText = value;
          break;
        case "trackArtist":
          this.shadowRoot.querySelector("#artist").innerText = value;
          break;
        case "trackCover":
          this.shadowRoot.querySelector("#cover").src = value;
          break;
        case "isPaused":
          this.shadowRoot.querySelector("#play-pause").innerHTML =
            value === "true"
              ? `<i class="fa-solid fa-play"></i>`
              : `<i class="fa-solid fa-pause"></i>`;
          this.shadowRoot
            .querySelector("#play-pause")
            .setAttribute("data-paused", value);
      }
    });

    this.shadowRoot.querySelector("#play-pause").addEventListener("click",()=>{
        const isPaused = this.shadowRoot.querySelector("#play-pause").getAttribute("data-paused") === "true"
        if(isPaused){
            Android?.resumeMusic()
        }
        else{
            Android?.pauseMusic()
        }
    })

    this.shadowRoot.querySelector("#previous").addEventListener("click",() => {
        Android?.previousMusic()
    })


    this.shadowRoot.querySelector("#next").addEventListener("click",() => {
        Android?.nextMusic()
    })
  }

  openSpotify() {
    window.location = `app://com.spotify.music`;
  }
}

window.customElements.define("spotify-widget", SpotifyWidget);
