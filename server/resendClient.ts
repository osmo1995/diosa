type ResendEmail = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendResendEmail(email: ResendEmail): Promise<{ id?: string } | null> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(email),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Resend error ${res.status}: ${text}`);
  }

  return (await res.json()) as { id?: string };
}
