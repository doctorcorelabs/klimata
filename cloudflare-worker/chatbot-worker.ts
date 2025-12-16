export default {
  async fetch(request: Request, env: any) {
    const corsHeaders = (() => {
      const origin = request.headers.get('Origin') || '*';
      return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, HTTP-Referer, X-Title',
      };
    })();

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST with JSON body' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let body: any;
    try {
      body = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const model = body.model || 'google/gemini-2.5-flash-lite';
    const clientMessages = Array.isArray(body.messages) ? body.messages : [];

    // System instruction (in Indonesian) about dampak perubahan iklim dan informasi bencana
    const systemInstruction = `Anda adalah asisten ahli yang menyediakan informasi yang akurat, ringkas, dan dapat diandalkan mengenai dampak perubahan iklim, mitigasi, adaptasi, dan informasi bencana alam. Sertakan:

1) Gambaran singkat tentang bagaimana perubahan iklim meningkatkan frekuensi dan intensitas bencana (banjir, kekeringan, badai, gelombang panas, tanah longsor, kebakaran hutan, dan naiknya permukaan laut).
2) Dampak kesehatan publik (penyakit menular, stres panas, kualitas udara), keamanan pangan dan air, serta kerentanan sosial-ekonomi (pemukiman pesisir, petani kecil, kelompok rentan).
3) Rekomendasi mitigasi (kurangi emisi, energi terbarukan, konservasi tanah/air) dan langkah adaptasi praktis (perbaikan drainase, vegetasi penahan, sistem peringatan dini, rencana evakuasi). 
4) Panduan keselamatan saat bencana: langkah segera saat banjir, tanah longsor, gempa, kebakaran, dan badai; nomor darurat; sumber informasi resmi (BMKG, BPBD, Kementerian Kesehatan) dan anjuran evakuasi.
5) Penjelasan singkat tentang bagaimana komunitas dapat membangun ketahanan: pendidikan, pelatihan, penyimpanan logistik, dan koordinasi lokal.

Berikan peringatan: jawaban ini bersifat informatif dan bukan pengganti instruksi dari otoritas darurat setempat. Jika situasi darurat, selalu prioritaskan arahan otoritas dan layanan darurat.`;

    const messages = [
      { role: 'system', content: [{ type: 'text', text: systemInstruction }] },
      ...clientMessages,
    ];

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    };

    if (body.referer) headers['HTTP-Referer'] = body.referer;
    if (body.title) headers['X-Title'] = body.title;

    const maxOutputTokens = body.max_output_tokens || (body.max_chars ? Math.ceil(body.max_chars / 4) : undefined);

    const payload: any = { model, messages };
    if (typeof maxOutputTokens === 'number') payload.max_output_tokens = maxOutputTokens;

    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const contentType = resp.headers.get('content-type') || 'application/json';
      const text = await resp.text();

      return new Response(text, {
        status: resp.status,
        headers: { 'Content-Type': contentType, ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
