import { authentication } from "../services/authenticacion.js";

export const verifyAuth = async (request, response, next) => {
  const { token } = request.headers;
  const [email, password] = token.split(":");
  const user = authentication.verifyUser(email, password);
  if (!user) {
    throw new Error("invalid user");
  }
  request.user = user;
  console.log("user", user);
};

export const authenticationRoutes = (fastify, opts, done) => {
  fastify.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = authentication.verifyUser(email, password);
    if (!user) {
      console.log("here");
      res.code(403).send({
        status: "error",
        message: "invalid user and/or password",
      });
    } else {
      res.send(user);
    }
  });

  fastify.post("/create-user", async (req, res) => {
    await verifyAuth(req, res);
    const user = await authentication.createUser(req.body);
    res.send({
      email: user.email,
      password: user.password,
    });
  });

  done();
};
