// 공부 기록과 필기 동기화 (혼자 쓰는 용도)
// 필요한 환경변수: SYNC_KEY (내가 정한 비밀번호) + Upstash Redis 연결 시 자동으로 생기는 KV_REST_API_URL, KV_REST_API_TOKEN
// (또는 UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const secret = process.env.SYNC_KEY;
  if (!url || !token || !secret) {
    res.status(503).json({ error: 'not_configured', redis: !!(url && token), key: !!secret });
    return;
  }
  if (req.headers['x-sync-key'] !== secret) { res.status(401).json({ error: 'bad_key' }); return; }
  const redis = async cmd => {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    return j.result;
  };
  const okKey = k => /^[\w:\/.\-]{1,200}$/.test(k);
  try {
    if (req.method === 'GET') {
      if (req.query.list) { res.status(200).json({ keys: (await redis(['SMEMBERS', 'gnn:keys'])) || [] }); return; }
      const k = String(req.query.k || '');
      if (!okKey(k)) { res.status(400).json({ error: 'bad_k' }); return; }
      if (k === 'ping') { res.status(200).json({ value: null, ok: true }); return; }
      const v = await redis(['GET', 'gnn:' + k]);
      res.status(200).json({ value: v ? JSON.parse(v) : null });
      return;
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const k = String(body.k || '');
      if (!okKey(k)) { res.status(400).json({ error: 'bad_k' }); return; }
      const s = JSON.stringify(body.value == null ? null : body.value);
      if (s.length > 950000) { res.status(413).json({ error: 'too_large' }); return; }
      await redis(['SET', 'gnn:' + k, s]);
      await redis(['SADD', 'gnn:keys', k]);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'method' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
