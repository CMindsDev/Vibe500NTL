import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const allowedTypes = new Set([
  "STARTUP",
  "INVESTOR_FUND",
  "ACCELERATOR_ENABLER",
  "COMPANY_SUPPLY_CHAIN",
] as const);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const organizationType = body?.organizationType;
    const payload = body?.payload;

    if (!organizationType || !allowedTypes.has(organizationType)) {
      return NextResponse.json(
        { error: "organizationType inválido" },
        { status: 400 },
      );
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "payload inválido" }, { status: 400 });
    }

    const submission = await prisma.joinSubmission.create({
      data: {
        organizationType,
        payload,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, submission }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el formulario" },
      { status: 500 },
    );
  }
}
