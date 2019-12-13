import "./env";
import { GraphQLServer } from "graphql-yoga";
import logger from "morgan";
import schema from "./schema";
import { refreshState, serverRefresh } from "./serverFunctions/serverRefresh";
import { athenticateJwt } from "./passport";
import { isAuthenticated } from "./middlewares";

const PORT = process.env.PORT || 4000;

const server = new GraphQLServer({
  schema,
  context: ({ request }) => ({ request, isAuthenticated })
});

setInterval(() => {
  if (!refreshState) {
    serverRefresh();
  }
}, 5000);

server.express.use(logger("dev"));
server.express.use(athenticateJwt);

server.start({ port: PORT }, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
