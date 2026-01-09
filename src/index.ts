import "dotenv/config";
import { app } from "./app";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Your express server is listening at port:${PORT}`);
});
