import { NextResponse } from 'next/server';
import { handleUpdate, setWebhook } from '@/lib/bot';
import { initDb } from '@/lib/db';

let dbInitialized = false;

export async function POST(request) {
  // Init DB on first request
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }

  try {
    const body = await request.json();
    // Process update in background — return 200 quickly so Telegram doesn't retry
    handleUpdate(body).catch(e => console.error('Webhook handler error:', e));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET — for setting webhook manually: /api/webhook?setup=1
export async function GET(request) {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get('setup') === '1') {
    const url = new URL(request.url);
    const webhookUrl = `${url.origin}/api/webhook`;
    await setWebhook(webhookUrl);
    return NextResponse.json({ ok: true, webhook: webhookUrl });
  }

  return NextResponse.json({ status: 'running' });
}
