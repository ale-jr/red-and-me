export const openWazeLink = (latitude, longitude) => {
  window.location =
    latitude && longitude
      ? `https://www.waze.com/ul?ll=${latitude}%2C${longitude}&navigate=yes`
      : "https://www.waze.com/ul";
};
