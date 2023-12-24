import axios from "axios";
import { DEFAULT_LAT, DEFAULT_LNG, HERE_KEY } from "../consts/keys.js";
const createMapSearchService = () => {
  /**
   *
   * @param {string} query
   * @param {string} latitude
   * @param {string} longitude
   * @param {boolean} isPlace
   */
  const search = (query, latitude, longitude, isPlace) => {
    const url = isPlace
      ? "https://discover.search.hereapi.com/v1/discover"
      : "https://discover.search.hereapi.com/v1/geocode";
    return axios
      .get(url, {
        params: {
          apiKey: HERE_KEY,
          q: query,
          at: `${latitude || DEFAULT_LAT},${longitude || DEFAULT_LNG}`,
        },
      })
      .then((r) => {
        const items = r.data.items.map((item) => ({
          title: item.title,
          address: item.address,
          latitude: item.access ? item.access[0]?.lat : item.position.lat,
          longitude: item.access ? item.access[0]?.lng : item.position.lng,
        }));

        return items;
      });



  };

  const getETA = (origin, destination) => {
    const url = `https://router.hereapi.com/v8/routes`

    return axios.get(url, {
      params: {
        apiKey: HERE_KEY,
        transportMode: 'car',
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        return: 'summary'
      }
    }).then(({ data }) => {
      return data.routes[0].sections[0].summary
    })

  }

  //?transportMode=car&origin=52.5308,13.3847&destination=52.5323,13.3789&return=summary&apikey=byG0v6gZ2ffCIROa3elC44bTuWYMGQU4VuSXpRw8wKU
  return {
    search,
    getETA
  };
};

export const mapSearch = createMapSearchService();
