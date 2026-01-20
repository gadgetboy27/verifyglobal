import { NextRequest, NextResponse } from "next/server";
import { saltedgeRequest } from "../lib/saltedge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    const endpoint = `/${path}${searchParams ? "?" + searchParams : ""}`;

    const result = await saltedgeRequest(endpoint, "GET");
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const body = await request.json();
    const endpoint = `/${path}`;

    const result = await saltedgeRequest(endpoint, "POST", body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
