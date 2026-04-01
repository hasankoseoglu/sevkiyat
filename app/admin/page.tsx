'use client';

import { useState, useEffect } from 'react';

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

export default function AdminPage() {
  const [sevkiyatlar, setSevkiyatlar] = useState<Sevkiyat[]>([]);
  const [tarih, setTarih] = useState('');
  const [adres, setAdres] = useState('');
  const [urunler, setUrunler] = useState<Urun[]>([{ adi: '', miktar: 0 }]);
  const [filterTarih, setFilterTarih] = useState('');
  const [filterAdres, setFilterAdres] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSevkiyatlar();
    const interval = setInterval(fetchSevkiyatlar, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSevkiyatlar = async () => {
    try {
      const res = await fetch('/api/sevkiyat');
      const data = await res.json();
      setSevkiyatlar(data);
    } catch (err) {
      console.error('Sevkiyatları çekme hatası', err);
    }
  };

  const addUrun = () => {
    setUrunler([...urunler, { adi: '', miktar: 0 }]);
  };

  const updateUrun = (index: number, field: keyof Urun, value: string | number) => {
    const newUrunler = [...urunler];
    newUrunler[index] = { ...newUrunler[index], [field]: value };
    setUrunler(newUrunler);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarih || !adres) {
      setError('Tarih ve adres zorunludur.');
      return;
    }

    const filteredUrunler = urunler.filter((u) => u.adi.trim());
    if (!filteredUrunler.length) {
      setError('En az bir ürün girin.');
      return;
    }

    const hasZeroMiktar = filteredUrunler.some((u) => u.miktar <= 0);
    if (hasZeroMiktar) {
      setError('Ürün adeti 0 olamaz. Lütfen 0 olmayan miktarlar girin.');
      return;
    }

    setError('');
    const newSevkiyat = { tarih, adres, urunler: filteredUrunler };
    await fetch('/api/sevkiyat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSevkiyat),
    });
    fetchSevkiyatlar();
    setTarih('');
    setAdres('');
    setUrunler([{ adi: '', miktar: 0 }]);
  };

  const getStatusColor = (durum: string) => {
    switch (durum) {
      case 'bekliyor':
        return 'bg-yellow-100 text-yellow-900';
      case 'sorunlu':
        return 'bg-red-100 text-red-900';
      case 'tamamlandı':
        return 'bg-green-100 text-green-900';
      case 'iptal':
        return 'bg-gray-100 text-gray-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const filteredSevkiyatlar = sevkiyatlar.filter((s) => {
    const tarihMatch = !filterTarih || s.tarih === filterTarih;
    const adresMatch = !filterAdres || s.adres.toLowerCase().includes(filterAdres.toLowerCase());
    const durumMatch = !filterDurum || s.durum === filterDurum;
    return tarihMatch && adresMatch && durumMatch;
  });

  const handleListele = () => {
    // Butonu ile filtrelemeyi güncellemek isterseniz bu alanı ek işleme gerek kalmadan kullanabilirsiniz.
  };

  const handleTemizle = () => {
    setFilterTarih('');
    setFilterAdres('');
    setFilterDurum('');
  };

  const handleRapor = () => {
    const bugun = new Date().toISOString().split('T')[0];
    const bugunSevkiyat = sevkiyatlar.filter((s) => s.tarih === bugun);
    alert(`Günlük sevkiyat sayısı: ${bugunSevkiyat.length}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="bg-amber-500 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Sevkiyat-Nakliye Yönetimi</h1>
        <p className="text-sm opacity-90">Yönetici - Sevkiyat kaydı ve takip</p>
      </div>

      <main className="p-4 max-w-8xl mx-auto">
        <div className="bg-white shadow rounded-lg p-4 mb-4 sticky top-4 z-20">
          <h2 className="text-lg font-semibold mb-3">Filtreleme</h2>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium">Sevkiyat Tarihi</label>
              <input type="date" value={filterTarih} onChange={(e) => setFilterTarih(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Gidilecek Yer / Adres</label>
              <input type="text" value={filterAdres} onChange={(e) => setFilterAdres(e.target.value)} placeholder="Adres ara" className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Sevkiyat Durumu</label>
              <select value={filterDurum} onChange={(e) => setFilterDurum(e.target.value)} className="mt-1 block w-full border rounded p-2">
                <option value="">Durum seçiniz</option>
                <option value="bekliyor">Bekliyor</option>
                <option value="sorunlu">Sorunlu</option>
                <option value="tamamlandı">Tamamlandı</option>
                <option value="iptal">İptal</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleListele} className="bg-blue-600 text-white rounded px-4 py-2">Listele</button>
              <button onClick={handleTemizle} className="border border-slate-300 rounded px-4 py-2">Temizle</button>
              <button onClick={handleRapor} className="bg-purple-600 text-white rounded px-4 py-2">Günlük Rapor</button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Yeni Sevkiyat Oluştur</h2>
          {error && <div className="mb-3 text-red-700 bg-red-100 rounded p-2">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">Tarih</label>
              <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium">Adres</label>
              <input type="text" value={adres} onChange={(e) => setAdres(e.target.value)} placeholder="Sevkiyat Adresi" className="mt-1 block w-full border rounded p-2" />
            </div>
          </div>

          <div className="border rounded p-3 mb-4 bg-gray-50">
            <h3 className="text-sm font-semibold mb-2">Ürünler</h3>
            {urunler.map((urun, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input type="text" value={urun.adi} onChange={(e) => updateUrun(idx, 'adi', e.target.value)} placeholder="Ürün" className="flex-1 border rounded p-2" />
                <input type="number" min="1" value={urun.miktar} onChange={(e) => updateUrun(idx, 'miktar', Number(e.target.value))} placeholder="Miktar" className="w-24 border rounded p-2" />
              </div>
            ))}
            <button type="button" onClick={addUrun} className="bg-blue-500 text-white px-3 py-1 rounded">Ürün Ekle</button>
          </div>

          <button onClick={handleSubmit} className="bg-green-600 text-white rounded px-4 py-2">Sevkiyatı Oluştur</button>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Sevkiyat Listeleme</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-slate-300 text-sm">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="p-2 border border-slate-300">#</th>
                  <th className="p-2 border border-slate-300">Tarih</th>
                  <th className="p-2 border border-slate-300">Adres</th>
                  <th className="p-2 border border-slate-300">Durum</th>
                  <th className="p-2 border border-slate-300">Not</th>
                  <th className="p-2 border border-slate-300">Ürünler</th>
                </tr>
              </thead>
              <tbody>
                {filteredSevkiyatlar.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-100">
                    <td className="p-2 border border-slate-300">{s.id}</td>
                    <td className="p-2 border border-slate-300">{s.tarih}</td>
                    <td className="p-2 border border-slate-300">{s.adres}</td>
                    <td className={`p-2 border border-slate-300 ${getStatusColor(s.durum)}`}>{s.durum}</td>
                    <td className="p-2 border border-slate-300">{s.not || '-'}</td>
                    <td className="p-2 border border-slate-300">
                      {s.urunler.map((u, idx) => (
                        <div key={idx} className="text-xs">{u.adi} ({u.miktar})</div>
                      ))}
                    </td>
                  </tr>
                ))}
                {!filteredSevkiyatlar.length && (
                  <tr>
                    <td className="p-4 text-center" colSpan={6}>Kayıt bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
