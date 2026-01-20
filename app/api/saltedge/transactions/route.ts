import { NextRequest, NextResponse } from 'next/server';
import { saltedgeRequest } from '../lib/saltedge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const connectionId = searchParams.get('connection_id');
    const accountId = searchParams.get('account_id');
    
    const params = new URLSearchParams();
    if (connectionId) params.append('connection_id', connectionId);
    if (accountId) params.append('account_id', accountId);

    // Default to fetching transactions if connection_id is present
    const result = await saltedgeRequest(`/transactions?${params.toString()}`);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}