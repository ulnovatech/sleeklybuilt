import { NextResponse } from 'next/server';
import { getAuthMode } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({
    authMode: getAuthMode(),
    performanteUrl:
      process.env.PERFORMANTE_URL?.trim() || 'https://sleeklybuilt.pro/performante',
  });
}
