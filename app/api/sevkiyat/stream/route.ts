import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const dataPath = path.join(process.cwd(), 'data', 'sevkiyat.json');

const createStream = () => {
  let lastData = '';

  return new ReadableStream({
    start(controller) {
      const sendData = () => {
        try {
          const raw = fs.readFileSync(dataPath, 'utf8');
          const parsed = JSON.parse(raw);
          const compact = JSON.stringify(parsed);
          if (compact !== lastData) {
            lastData = compact;
            controller.enqueue(`data: ${compact}\n\n`);
          }
        } catch (error) {
          controller.enqueue(`event: error\ndata: ${JSON.stringify({ message: 'Dosya okunamadı veya JSON hatası.' })}\n\n`);
        }
      };

      sendData();
      const timer = setInterval(sendData, 1000);

      return () => clearInterval(timer);
    },
    cancel() {
      // Stream iptal edildi.
    },
  });
};

export async function GET() {
  const stream = createStream();

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
