import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'sevkiyat.json');

export async function GET() {
  const data = fs.readFileSync(dataPath, 'utf8');
  const sevkiyatlar = JSON.parse(data);
  return NextResponse.json(sevkiyatlar);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = fs.readFileSync(dataPath, 'utf8');
  const sevkiyatlar = JSON.parse(data);
  const newSevkiyat = { id: Date.now().toString(), ...body, durum: 'bekliyor' };
  sevkiyatlar.push(newSevkiyat);
  fs.writeFileSync(dataPath, JSON.stringify(sevkiyatlar, null, 2));
  return NextResponse.json(newSevkiyat);
}