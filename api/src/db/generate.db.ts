import "dotenv/config";
import moduleAlias from "module-alias";
import path from "path";

//register aliase
moduleAlias.addAliases({
  "@resolvers": path.join(__dirname, "../", "resolvers"),
  "@validations": path.join(__dirname, "../", "validations"),
  "@utils": path.join(__dirname, "../", "utils"),
  "@middlewares": path.join(__dirname, "..", "middlewares"),
  "@services": path.join(__dirname, "..", "services"),
  "@schemas": path.join(__dirname, "..", "schemas"),
  "@controller": __dirname + "/controller",
});
