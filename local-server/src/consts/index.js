import { development } from "./development.js";
import { production } from "./production.js";

export const consts = process.env.NODE_ENV === "production" ? production : development