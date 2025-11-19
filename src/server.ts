import app from "./app";
import { config } from "./config";
import { connectDB } from "./config/db";
import { seedAdmin } from "./config/seedAdmin";

connectDB().then(async () => {
  await seedAdmin();

  const PORT = config.port;
  const HOST = config.host;

  app.get("/", (_req, res) => {
    res.send("Farberge server is running perfectly!");
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
});
