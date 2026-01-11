export async function posthogCapture(cfg: { host: string; apiKey: string }, input: any) {
  const res = await fetch(`${cfg.host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: cfg.apiKey,
      event: input.event,
      distinct_id: input.distinct_id,
      properties: input.properties
    })
  });
  return { ok: res.ok, status: res.status };
}
