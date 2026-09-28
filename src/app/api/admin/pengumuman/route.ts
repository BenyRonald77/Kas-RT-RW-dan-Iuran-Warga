import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pengumumanSchema } from "@/lib/validation/pengumuman";

export const dynamic = "force-dynamic";

export async function GET() {
  const daftar = await prisma.pengumuman.findMany({ orderBy: { tanggal: "desc" } });
  return NextResponse.json(daftar);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pengumumanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  const pengumuman = await prisma.pengumuman.create({
    data: { judul: parsed.data.judul, isi: parsed.data.isi },
  });

  return NextResponse.json(pengumuman, { status: 201 });
}
