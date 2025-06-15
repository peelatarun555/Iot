import "dotenv/config";
import moduleAlias from "module-alias";
import "reflect-metadata";
import app from "./app"; // This is an instance of your App class, NOT an Express app

moduleAlias.addAliases({
  "@resolvers": __dirname + "/resolvers",
  "@validations": __dirname + "/validations",
  "@utils": __dirname + "/utils",
  "@middlewares": __dirname + "/middlewares",
  "@services": __dirname + "/services",
  "@schemas": __dirname + "/schemas",
  "@db": __dirname + "/db",
  "@controller": __dirname + "/controller",
});

// Set timezone
process.env.TZ = "Europe/Berlin";

// ✅ Call your custom method with no arguments
app.listen();
