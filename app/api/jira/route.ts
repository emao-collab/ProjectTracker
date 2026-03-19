import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { domain, email, apiToken, path } = await req.json();

  if (!domain || !email || !apiToken || !path) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const url = `https://${domain}${path}`;
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}
