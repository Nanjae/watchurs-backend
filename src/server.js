import "./env";
import { GraphQLServer } from "graphql-yoga";
import logger from "morgan";
import schema from "./schema";
import updateData, { updateIng } from "./updateData";

const PORT = process.env.PORT || 4000;

const server = new GraphQLServer({
  schema,
  // context: ({ request }) => ({ request, isAuthenticated })
});

setInterval(() => {
  if (!updateIng) {
    updateData();
  }
}, 10000);

server.express.use(logger("dev"));

server.start({ port: PORT }, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
