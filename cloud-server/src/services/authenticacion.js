import { db } from "./database.js";
import { hashSync, compareSync } from "bcrypt";
/**
 * @typedef {Object} User
 * @property {string} email - user email
 * @property {string} password - user password
 * @property {string} hash - user password
 * @property {string} name - user name
 */

const createAuthentication = () => {
  /**
   *
   * @param {User} user
   */
  const createUser = (user) => {
    const hasUser = db.data.users.find((u) => u.email === user.email);
    if (hasUser) throw new Error("user already exists");

    const hash = hashSync(user.password, 10);

    delete user.password
    db.data.users.push({
      ...user,
      hash,
    });

    return db.write();
  };

  const deleteUser = (email) => {
    const updatedUsers = db.data.users.filter((user) => user.email !== email);
    db.data.users = updatedUsers;
    return db.write();
  };

  /**
   * Verifies user and password
   * @param {string} email
   * @param {string} password
   * @return {User}
   */
  const verifyUser = (email, password) => {
    const user = db.data.users.find((u) => {
      if (email !== u.email) return false;
      const matches = compareSync(password, u.hash);
      return matches;
    });

    return user;
  };

  return {
    createUser,
    deleteUser,
    verifyUser,
  };
};

export const authentication = createAuthentication();
