import { createServer } from "./app";
import dotenv from "dotenv";

const main = async () => {
  dotenv.config();

  const app = createServer();

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
