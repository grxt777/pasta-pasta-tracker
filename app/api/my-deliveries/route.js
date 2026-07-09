import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

let dbInitialized = false;

export async function POST(request) {
  if (!dbInitialized) { await initDb(); dbInitialized = true; }

  const { driver_id } = await request.json();
  if (!driver_id) return NextResponse.json({ ok: false, error: 'Missing driver_id' }, { status: 400 });

  const db = getDb();
  const res = await db.execute(
    'SELECT * FROM deliveries WHERE driver_id = ? ORDER BY id DESC LIMIT 30',
    [driver_id]
  );

  const statusEmoji = { pending: '⏳', confirmed: '✅', rejected: '❌' };
  const typeEmoji = { pickup: '📦', delivery: '🚚' };

  const deliveries = res.rows.map(d => ({
    id: d.id,
    branch_name: d.branch_name,
    status: d.status,
    type: d.type,
    emoji: statusEmoji[d.status] || '❓',
    type_emoji: typeEmoji[d.type] || '📦',
    created_at: d.created_at,
    distance: Math.round(d.distance),
  }));

  return NextResponse.json({ deliveries });
}
