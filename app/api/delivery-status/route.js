import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

let dbInitialized = false;

export async function POST(request) {
  if (!dbInitialized) { await initDb(); dbInitialized = true; }

  const { delivery_id } = await request.json();
  if (!delivery_id) return NextResponse.json({ ok: false, error: 'Missing delivery_id' }, { status: 400 });

  const db = getDb();
  const res = await db.execute('SELECT * FROM deliveries WHERE id = ?', [delivery_id]);
  const d = res.rows[0];
  if (!d) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: d.id,
    status: d.status,
    type: d.type,
    branch_name: d.branch_name,
    created_at: d.created_at,
    confirmed_at: d.confirmed_at,
    confirmed_by_name: d.confirmed_by_name,
  });
}
