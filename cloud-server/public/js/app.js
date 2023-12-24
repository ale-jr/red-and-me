import { createWebsocket } from "./websocket.js";
document.addEventListener("DOMContentLoaded", () => {
  const hasCredentials = localStorage.getItem("credentials");
  const loginSection = document.querySelector("#login-section");
  const mainSection = document.querySelector("main");
  if (hasCredentials) {
    loginSection.classList.add("hidden");
    mainSection.classList.remove("hidden");
    fetchRoutePlannings();
  } else {
    loginSection.classList.remove("hidden");
    mainSection.classList.add("hidden");
  }

  document.querySelector("#login-btn").addEventListener("click", () => {
    const errorElement = document.querySelector("#error-text");
    errorElement.innerText = "";
    errorElement.classList.add("hidden");

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const init = {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: document.querySelector("#email-input").value,
        password: document.querySelector("#password-input").value,
      }),
    };
    fetch(new Request("login"), init)
      .then((r) => {
        if (r.ok) {
          return r.json();
        } else {
          throw new Error("erro ao efetuar login");
        }
      })
      .then((response) => {
        loginSection.classList.add("hidden");
        mainSection.classList.remove("hidden");
        localStorage.setItem(
          "credentials",
          `${response.email}:${document.querySelector("#password-input").value}`
        );
        localStorage.setItem("name", response.name);

        fetchRoutePlannings();
      })
      .catch((e) => {
        errorElement.innerText = e.message;
        errorElement.classList.remove("hidden");
      });
  });

  document.querySelector("#submit-query").addEventListener("click", () => {
    const errorElement = document.querySelector("#error-text");
    errorElement.innerText = "";
    errorElement.classList.add("hidden");

    const isPlace = !document.querySelector("#is-place-checkbox").checked;
    const query = document.querySelector("#query-input").value;

    const headers = new Headers();
    headers.append("token", localStorage.getItem("credentials"));

    const init = {
      method: "GET",
      headers,
    };

    const url = new URL(`${window.location.origin}/map-search`);

    url.searchParams.append("q", query);
    url.searchParams.append("isPlace", isPlace);

    const btnEl = document.querySelector("#submit-query");
    btnEl.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
    fetch(new Request(url), init)
      .then((r) => {
        if (r.ok) {
          return r.json();
        } else {
          throw new Error("erro ao executar busca");
        }
      })
      .then((results) => {
        const list = document.querySelector("#results-section ul");

        list.innerHTML = "";

        results.forEach((result) => {
          const li = document.createElement("li");

          li.innerHTML = `
            <p class="title">${result.title}</p>
            <p class="subtitle">${result.address.label}</p>
            <div class="actions">
              <button class="icon-button">
                <i class="fa-solid fa-plus"></i> Adicionar
              </button>
            </div>
          `;

          const button = li.querySelector("button");

          button.addEventListener("click", () => {
            addNewRoutePlanning(
              result.latitude,
              result.longitude,
              result.title,
              button
            );
          });
          list.appendChild(li);
        });
      })
      .catch((e) => {
        alert(`Erro ao buscar: ${e.message}`)
      })
      .finally(() => {
        btnEl.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`;
      })
  });

  document
    .querySelector("#open-route-planning-modal")
    .addEventListener("click", () => {
      openAddRouteModal();
    });

  document
    .querySelector("#route-modal-backdrop")
    .addEventListener("click", () => {
      closeAddRouteModal();
    });

  document
    .querySelector("#route-modal .modal-close")
    .addEventListener("click", () => {
      closeAddRouteModal();
    });


  renderTrackingMap();
  document.querySelector("#refresh-position").addEventListener("click", () => {
    fetchTracking()
  })

  createWebsocket({
    device: 'pwa',
    onMessage: (data) => {
      if (data.type === "positionChange") {
        carLat = data.point.lat
        carLng = data.point.lat
        carSpeed = data.point.speed
      }
    },
  })
});

const addNewRoutePlanning = (lat, lng, name, button) => {
  const routeName = prompt("Nome da rota", name);
  button.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Adicionando`;

  const errorElement = document.querySelector("#error-text");
  errorElement.innerText = "";
  errorElement.classList.add("hidden");

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("token", localStorage.getItem("credentials"));

  const init = {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: String(Date.now()),
      title: routeName,
      completed: false,
      latitude: lat,
      longitude: lng,
    }),
  };
  fetch(new Request("route-plannings"), init)
    .then((r) => {
      if (r.ok) {
        fetchRoutePlannings();
        closeAddRouteModal();
      } else {
        throw new Error("erro no backend");
      }
    })
    .catch((e) => {
      alert(`Erro ao adicionar rota: ${e.message}`);
    })
    .finally(() => {
      button.innerHTML = `<i class="fa-solid fa-plus"></i> Adicionar`;
    });
};

const fetchRoutePlannings = () => {
  const errorElement = document.querySelector("#error-text");
  errorElement.innerText = "";
  errorElement.classList.add("hidden");

  const headers = new Headers();
  headers.append("token", localStorage.getItem("credentials"));

  const init = {
    method: "GET",
    headers,
  };

  const url = new URL(`${window.location.origin}/route-plannings`);

  fetch(new Request(url), init)
    .then((r) => {
      if (r.ok) {
        return r.json();
      } else {
        throw new Error("erro ao executar busca");
      }
    })
    .then((results) => {
      const list = document.querySelector("#route-plannings-list");

      list.innerHTML = "";

      results.forEach((result) => {
        const li = document.createElement("li");
        const button = document.createElement("button");

        button.addEventListener("click", () => {
          removeRoutePlanning(result.id, button);
        });

        button.innerHTML = `
               <i class="fa-solid fa-trash"></i>
        `;

        button.classList.add("icon-button");

        li.innerHTML = `
                    <span>
                        ${result.title}
                    </span>`;
        li.appendChild(button);
        list.appendChild(li);

        if (result.completed)
          li.querySelector("span").classList.add("completed");
      });
    })
    .catch((e) => {
      errorElement.innerText = e;
      errorElement.classList.remove("hidden");
    });
};

const removeRoutePlanning = (id, button) => {
  if (!confirm("Deseja excluir o item?")) return;
  button.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;

  const errorElement = document.querySelector("#error-text");
  errorElement.innerText = "";
  errorElement.classList.add("hidden");

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("token", localStorage.getItem("credentials"));

  const init = {
    method: "DELETE",
    headers,
  };
  fetch(new Request(`route-plannings/${id}`), init)
    .then((r) => {
      if (r.ok) {
        fetchRoutePlannings();
        alert("removido!");
      } else {
        throw new Error("erro ao remover item");
      }
    })
    .catch((e) => {
      errorElement.innerText = e.message;
      errorElement.classList.remove("hidden");
    })
    .finally(() => {
      button.innerHTML = `
      <i class="fa-solid fa-trash"></i>
      `;
    });
};

const openAddRouteModal = () => {
  document.querySelector("#route-modal-backdrop").classList.remove("hidden");
  document.querySelector("#route-modal").classList.remove("hidden");

  const list = document.querySelector("#results-section ul");
  list.innerHTML = "";

  document.querySelector("#query-input").value = "";
};
const closeAddRouteModal = () => {
  document.querySelector("#route-modal-backdrop").classList.add("hidden");
  document.querySelector("#route-modal").classList.add("hidden");
};


let map;
const userIcon = L.icon({
  iconUrl: 'assets/vectors/location-dot-solid.svg',
  className: 'user-icon',
  iconSize: [30, 50],
  iconAnchor: [15, 45],
  shadowAnchor: [0, 0],
  popupAnchor: [0, 0]
});

const carIcon = L.icon({
  iconUrl: 'assets/vectors/car-side-solid.svg',
  className: 'user-icon',
  iconSize: [30, 50],
  iconAnchor: [15, 25],
  shadowAnchor: [0, 0],
  popupAnchor: [0, -20]
});
const renderTrackingMap = () => {

  map = L.map('map-tracking').setView([-23.6705902, -46.5387023], 15)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);


  fetchTracking()
}



const fetchTracking = async () => {
  const errorElement = document.querySelector("#error-text");


  const position = await getCurrentPosition()
  const headers = new Headers();
  headers.append("token", localStorage.getItem("credentials"));

  const init = {
    method: "GET",
    headers,
  };

  const url = new URL(`${window.location.origin}/tracking/last`);

  url.searchParams.append('lat', position.latitude)
  url.searchParams.append('lng', position.longitude)


  await fetch(new Request(url), init)
    .then((r) => {
      if (r.ok) {
        return r.json();
      } else {
        throw new Error("erro ao executar busca");
      }
    })
    .then(({ point, eta: { duration } }) => {
      carLat = point.lat;
      carLng = point.lng;
      carSpeed = point.speed * 3.6

      eta = Date.now() + (duration * 1000)

    })
    .catch((e) => {
      errorElement.innerText = e;
      errorElement.classList.remove("hidden");
    });

  updateTrackingMapPosition(true)
}

/**
 * Get user current location
 * @function
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>} 
 */
const getCurrentPosition = () => new Promise((resolve) => {
  navigator.geolocation.getCurrentPosition((position) => {
    resolve({
      accuracy: position.coords.accuracy,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,

    })
  })
})




let userPositionMarker = null
let carPositionMarker = null
let carLat = null;
let carLng = null
let carSpeed = 0;
let eta = null
const updateTrackingMapPosition = async (fitToMap = false) => {

  if (!carPositionMarker) {
    carPositionMarker = L.marker([carLat, carLng], { icon: carIcon }).addTo(map)
      .bindPopup(`Velocidade: ${carSpeed}km/h<br/>Chegada ás ${new Date(eta).toLocaleString()}`)
  }
  else {
    carPositionMarker.setLatLng([carLat, carLng])
    carPositionMarker.unbindPopup()
    carPositionMarker.bindPopup(`Velocidade: ${carSpeed}km/h<br/>Chegada ás ${new Date(eta).toLocaleString()}`)
  }

  const currentPosition = await getCurrentPosition()

  if (!userPositionMarker) {
    userPositionMarker = L.marker([currentPosition.latitude, currentPosition.longitude], { icon: userIcon }).addTo(map)
  }
  else {
    userPositionMarker.setLatLng([currentPosition.latitude, currentPosition.longitude])
  }


  if (fitToMap) {
    const group = L.featureGroup([carPositionMarker, userPositionMarker]);
    map.fitBounds(group.getBounds())
  }

}