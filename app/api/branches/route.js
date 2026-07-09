import { NextResponse } from 'next/server';
import { BRANCHES, FACTORY, DRIVER } from '@/lib/branches';

export async function POST() {
  return NextResponse.json({
    branches: BRANCHES.map(b => ({
      id: b.id, name: b.name, address: b.address, lat: b.lat, lng: b.lng,
    })),
    factory: {
      id: FACTORY.id, name: FACTORY.name, address: FACTORY.address, lat: FACTORY.lat, lng: FACTORY.lng,
    },
    driver: DRIVER,
  });
}
