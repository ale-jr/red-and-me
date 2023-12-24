// Remember to set type: module in package.json or use .mjs extension
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { DB_FILE_PATH } from "../consts/keys.js";

// db.json file path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = DB_FILE_PATH || join(__dirname, "..", "..", "db.json");

console.log
// Configure lowdb to write data to JSON file
const adapter = new JSONFile(file);
const defaultData = { users: [], routePlannings: [], tracking: [] };
export const db = new Low(adapter, defaultData);

// Read data from JSON file, this will set db.data content
// If JSON file doesn't exist, defaultData is used instead
await db.read();
