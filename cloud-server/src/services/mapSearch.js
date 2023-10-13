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

  return {
    search,
  };
};

export const mapSearch = createMapSearchService();
