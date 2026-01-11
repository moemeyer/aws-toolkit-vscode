export async function ga4Collect(cfg: { measurementId: string; apiSecret: string }, payload: any) {
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${cfg.measurementId}&api_secret=${cfg.apiSecret}`;
  const res = await fetch(url, { method: "POST", body: JSON.stringify(payload) });
  return { ok: res.ok, status: res.status };
}
