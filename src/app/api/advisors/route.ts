import { NextResponse } from "next/server";
import { GET as teamGET, POST as teamPOST, OPTIONS as teamOPTIONS } from "../team/route";

export async function OPTIONS() {
  return teamOPTIONS();
}

export async function GET(request: Request) {
  // If no category specified, default to advisors_and_consultants
  const url = new URL(request.url);
  if (!url.searchParams.has("category")) {
    url.searchParams.set("category", "advisors_and_consultants");
  }
  const req = new Request(url.toString(), {
    headers: request.headers,
    method: request.method,
  });
  return teamGET(req);
}

export async function POST(request: Request) {
  return teamPOST(request);
}
