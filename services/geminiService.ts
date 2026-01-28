
type StyleApiResponse = { imageBase64: string; mimeType: string };

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
  try {
    const res = await fetch('/api/style', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        preset,
        shade,
        length,
      }),
    });

    if (!res.ok) {
      console.error('Style API failed', res.status, await res.text());
      return null;
    }

    const json = (await res.json()) as StyleApiResponse;
    return asDataUrl(json.imageBase64, json.mimeType);
  } catch (e) {
    console.error('Style API error', e);
    return null;
  }
};

export const conciergeResponse = async (query: string): Promise<string> => {
  try {
    const res = await fetch('/api/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      return "I apologize, but I am having trouble connecting to the goddess realm right now. Please call us for immediate assistance.";
    }

    const json = (await res.json()) as ConciergeApiResponse;
    return json.text;
  } catch {
    return "I apologize, but I am having trouble connecting to the goddess realm right now. Please call us for immediate assistance.";
  }
};
