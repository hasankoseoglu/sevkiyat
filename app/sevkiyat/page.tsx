'use client';

import { useEffect, useState } from 'react';

interface Urun {
  adi: string;
  miktar: number;
}

interface Sevkiyat {
  id: string;
  tarih: string;
  adres: string;
  durum: 'bekliyor' | 'sorunlu' | 'tamamlandı' | 'iptal';
  not?: string;
  urunler: Urun[];
}

export default function WarehousePage() {
  const [sevkiyatlar, setSevkiyatlar] = useState<Sevkiyat[]>([]);
  const [selected, setSelected] = useState<Sevkiyat | null>(null);
  const [modalType, setModalType] = useState<'detay' | 'sorun' | null>(null);
  const [sorunText, setSorunText] = useState('');

  useEffect(() => {
    fetchSevkiyatlar();
  }, []);

  const fetchSevkiyatlar = async () => {
    const res = await fetch('/api/sevkiyat');
    const data = await res.json();
    setSevkiyatlar(data);
  };

  const updateStatus = async (id: string, durum: 'tamamlandı' | 'sorunlu' | 'iptal', not?: string) => {
    await fetch(`/api/sevkiyat/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durum, not }),
    });
    fetchSevkiyatlar();
    alert('Yöneticiye bildirim gönderildi!');
  };

  const handleTamamla = (id: string) => updateStatus(id, 'tamamlandı');
  const handleIptal = (id: string) => updateStatus(id, 'iptal');

  const handleSorun = async () => {
    if (!selected) return;
    if (!sorunText.trim()) {
      alert('Lütfen sorun açıklaması girin');
      return;
    }
    await updateStatus(selected.id, 'sorunlu', sorunText.trim());
    setModalType(null);
    setSorunText('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-amber-500 text-white p-4">
        <h1 className="text-2xl font-bold">Depo Sorumlusu Paneli</h1>
        <p className="text-sm opacity-90">Bekleyen sevkiyatları kontrol et, teslim et veya sorun bildir.</p>
      </header>

      <main className="p-4 max-w-8xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Tarih</th>
                <th className="p-2 border">Adres</th>
                <th className="p-2 border">Durum</th>
                <th className="p-2 border">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {sevkiyatlar.filter((s) => s.durum === 'bekliyor').map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{s.id}</td>
                  <td className="p-2 border">{s.tarih}</td>
                  <td className="p-2 border">{s.adres}</td>
                  <td className="p-2 border text-yellow-700">Bekliyor</td>
                  <td className="p-2 border space-x-1">
                    <button onClick={() => { setSelected(s); setModalType('detay'); }} className="bg-blue-600 text-white px-2 py-1 rounded">Detay</button>
                    <button onClick={() => handleTamamla(s.id)} className="bg-green-600 text-white px-2 py-1 rounded">Tamamlandı</button>
                    <button onClick={() => handleIptal(s.id)} className="bg-gray-600 text-white px-2 py-1 rounded">İptal</button>
                    <button onClick={() => { setSelected(s); setModalType('sorun'); }} className="bg-red-600 text-white px-2 py-1 rounded">Sorun</button>
                  </td>
                </tr>
              ))}
              {!sevkiyatlar.filter((s) => s.durum === 'bekliyor').length && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">Bekleyen sevkiyat yok</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalType && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[90%] md:w-1/2 p-5">
            {modalType === 'detay' && (
              <>
                <h2 className="text-xl font-semibold mb-3">Sevkiyat Detayı</h2>
                <p><strong>ID:</strong> {selected.id}</p>
                <p><strong>Tarih:</strong> {selected.tarih}</p>
                <p><strong>Adres:</strong> {selected.adres}</p>
                <p><strong>Durum:</strong> {selected.durum}</p>
                <p><strong>Ürünler:</strong></p>
                <ul className="list-disc pl-5 mb-3">
                  {selected.urunler.map((u, i) => (<li key={i}>{u.adi} - {u.miktar}</li>))}
                </ul>
                <button onClick={() => setModalType(null)} className="bg-gray-600 text-white px-3 py-1 rounded">Kapat</button>
              </>
            )}

            {modalType === 'sorun' && (
              <>
                <h2 className="text-xl font-semibold mb-3">Sorun Bildir</h2>
                <textarea
                  value={sorunText}
                  onChange={(e) => setSorunText(e.target.value)}
                  className="border w-full h-24 p-2 mb-3"
                  placeholder="Örneğin: ürün eksik / hasarlı / paketleme hatası"
                />
                <div className="flex gap-2">
                  <button onClick={handleSorun} className="bg-red-600 text-white px-3 py-1 rounded">Kaydet</button>
                  <button onClick={() => setModalType(null)} className="bg-gray-600 text-white px-3 py-1 rounded">İptal</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
