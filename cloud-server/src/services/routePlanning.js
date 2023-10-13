/**
 * @typedef {Object} RoutePlanning
 * @property {string} title
 * @property {string} id
 * @property {boolean} completed
 * @property {string} latitude
 * @property {string} longitude
 */

import { db } from "./database.js";

const createRoutePlanningService = () => {
  /**
   *
   * @param {RoutePlanning} route
   */
  const createRoutePlanning = (route) => {
    db.data.routePlannings.push(route);
    return db.write();
  };

  /**
   *
   * @param {string} id
   */
  const deleteRoutePlanning = (id) => {
    db.data.routePlannings = db.data.routePlannings.filter(
      (route) => route.id != id
    );
    return db.write();
  };

  /**
   *
   * @param {string} id
   * @returns
   */
  const completeRoutePlanning = (id) => {
    db.data.routePlannings = db.data.routePlannings.map((route) =>
      route.id === id
        ? {
            ...route,
            completed: true,
          }
        : route
    );

    return db.write();
  };

  const getIncompleteRoutePlannings = () => {
    return db.data.routePlannings.filter((route) => !route.completed);
  };

  const getAllRoutePlannings = () => {
    return db.data.routePlannings;
  };

  return {
    createRoutePlanning,
    deleteRoutePlanning,
    completeRoutePlanning,
    getAllRoutePlannings,
    getIncompleteRoutePlannings,
  };
};

export const routePlanning = createRoutePlanningService();
