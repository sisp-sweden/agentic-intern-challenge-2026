import { createServer } from "node:http";
import { rsvpToEvent } from "./rsvp.js";

const server = createServer(async (req, res) => {
  const match = req.url?.match(/^\/events\/([^/]+)\/rsvp$/);

  if (req.method === "POST" && match) {
    const eventId = match[1];
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};

    const result = await rsvpToEvent(eventId, body.userId ?? "anonymous");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Fieldnote RSVP service listening on :${PORT}`);
});
