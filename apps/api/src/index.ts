import { checkConnection } from "@cadchatscg/database";
import { createApp } from "./app.ts";

const port = Number(process.env.API_PORT ?? 3001);

try {
  await checkConnection();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

// Express 5 calls the listen callback on failure too, passing the error.
const server = createApp().listen(port, (error?: NodeJS.ErrnoException) => {
  if (error) {
    console.error(
      error.code === "EADDRINUSE"
        ? `Port ${port} is in use. Change API_PORT in apps/api/.env.`
        : `API failed to start: ${error.message}`,
    );
    process.exit(1);
  }
  console.log(`API listening on http://localhost:${port}/api`);
});

function shutdown() {
  server.close(() => process.exit(0));
  server.closeIdleConnections();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
