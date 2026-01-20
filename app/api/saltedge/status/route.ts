import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.SALTEDGE_APP_ID || '';
  const secret = process.env.SALTEDGE_SECRET || '';
  const hasPrivateKey = !!process.env.SALTEDGE_PRIVATE_KEY && !process.env.SALTEDGE_PRIVATE_KEY.includes('your_key_here');
  
  const mask = (str: string) => str.length > 8 ? `${str.substring(0, 4)}...${str.substring(str.length - 4)}` : '****';

  return NextResponse.json({
    app_id: !!appId,
    app_id_masked: appId ? mask(appId) : null,
    secret: !!secret,
    secret_masked: secret ? mask(secret) : null,
    private_key: hasPrivateKey,
    test_mode: !hasPrivateKey,
    environment: process.env.NODE_ENV || 'development',
    v6_ready: true
  });
}
