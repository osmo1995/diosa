
type StyleApiResponse = {
  imageBase64?: string;
  mimeType: string;
  publicUrl?: string | null;
  signedUrl?: string | null;
};

type ConciergeApiResponse = { text: string };

function asDataUrl(base64: string, mimeType: string) {
  return `data:${mimeType};base64,${base64}`;
}

export const generateStylePreview = async (
  base64Image: string,
  preset: string,
  shade: string,
  length: string
): Promise<string | null> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 90_000);

  try {
    // If signed in, attach Supabase JWT so server can enforce per-user quotas.
    let accessToken: string | null = null;
    try {
      const { supabaseClient } = await import('./supabaseClient');
      const s = supabaseClient ? await supabaseClient.auth.getSession() : null;
      accessToken = s?.data?.session?.access_token ?? null;
    } catch {}

    const res = await fetch('/api/style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        imageBase64: base64Image,
        preset,
        shade,
        length,
        includeBase64: false,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Style API failed', res.status, txt);
      // Surface quota errors to the UI.
      if (res.status === 401) throw new Error('auth_required');
      if (res.status === 402) throw new Error('quota_exhausted');
      throw new Error(`style_api_${res.status}`);
    }

    const json = (await res.json()) as StyleApiResponse;

    if (json.signedUrl) return json.signedUrl;
    if (json.publicUrl) return json.publicUrl;
    if (json.imageBase64) return asDataUrl(json.imageBase64, json.mimeType);
    return null;
  } catch (e) {
    console.error('Style API error', e);
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const conciergeResponse = async (query: string): Promise<string> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch('/api/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return "I apologize, but I am having trouble connecting to the goddess realm right now. Please call us for immediate assistance.";
    }

    const json = (await res.json()) as ConciergeApiResponse;
    return json.text;
  } catch {
    return "I apologize, but I am having trouble connecting to the goddess realm right now. Please call us for immediate assistance.";
  } finally {
    window.clearTimeout(timeout);
  }
};
