import { navigation } from "../consts/navigation.js";

const startClockCard = () => {
  const cardEl = document.querySelector("#clock-card");
  const timeEl = cardEl?.querySelector(".time");
  const dateEl = cardEl?.querySelector(".date");

  cardEl.addEventListener("click", () => {
    document
      .querySelector("settings-modal")
      .dispatchEvent(new CustomEvent("open"));
  });

  const updateClock = () => {
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();

    if (timeEl) timeEl.textContent = time;
    if (dateEl) dateEl.textContent = date;
  };

  setInterval(updateClock, 1000);
  updateClock();
};

export const startWidgets = () => {
  startClockCard();
};
