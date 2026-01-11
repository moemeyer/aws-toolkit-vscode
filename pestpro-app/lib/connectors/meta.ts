export async function metaSendEvents(cfg: { pixelId: string; accessToken: string }, events: any[]) {
  const url = `https://graph.facebook.com/v20.0/${cfg.pixelId}/events?access_token=${cfg.accessToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: events })
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, meta: json };
}
