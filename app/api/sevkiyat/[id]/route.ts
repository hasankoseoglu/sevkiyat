import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'sevkiyat.json');

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const data = fs.readFileSync(dataPath, 'utf8');
  const sevkiyatlar = JSON.parse(data);
  const index = sevkiyatlar.findIndex((s: any) => s.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  sevkiyatlar[index] = { ...sevkiyatlar[index], ...body };
  fs.writeFileSync(dataPath, JSON.stringify(sevkiyatlar, null, 2));
  return NextResponse.json(sevkiyatlar[index]);
}