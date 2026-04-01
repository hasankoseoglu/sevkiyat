import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Sevkiyat Yönetim Sistemi</h1>
      <div className="space-x-4">
        <Link href="/admin" className="bg-blue-500 text-white px-6 py-3 rounded">Yönetici Paneli</Link>
        <Link href="/sevkiyat" className="bg-green-500 text-white px-6 py-3 rounded">Depo Sorumlusu</Link>
      </div>
    </div>
  );
}
