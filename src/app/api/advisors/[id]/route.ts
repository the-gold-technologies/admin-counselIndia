import { NextResponse } from "next/server";
import {
  PATCH as teamPATCH,
  DELETE as teamDELETE,
  OPTIONS as teamOPTIONS,
} from "../../team/[id]/route";

export async function OPTIONS() {
  return teamOPTIONS();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return teamPATCH(request, context);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  return teamDELETE(request, context);
}
