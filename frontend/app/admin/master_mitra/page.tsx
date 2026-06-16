'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, ChevronDown, Globe, Pencil, Plus, Search, Trash2, Users, type LucideIcon } from 'lucide-react';
import {
  createMasterMitra,
  deleteMasterMitra,
  getMasterMitra,
  updateMasterMitra,
  type MasterMitra,
} from '@/services/masterMitraService';

type FormState = {
  nama_mitra: string;
  kategori_mitra: string;
  negara: string;
  website: string;
  alamat: string;
  email_mitra: string;
  telepon_mitra: string;
  nama_kontak_utama: string;
  jabatan_kontak_utama: string;
  email_kontak_utama: string;
  telepon_kontak_utama: string;
  aktif: boolean;
};

type GroupedMitraRow = {
  primary: MasterMitra;
  nama_mitra: string;
  kategori_mitra: string;
  negara: string;
  email_mitra: string | null;
  aktif: boolean;
  groupCount: number;
  hasDomestik: boolean;
  hasLuarNegeri: boolean;
  kontakList: Array<{
    nama: string;
    jabatan: string;
    email: string;
    telepon: string;
  }>;
};

const emptyForm: FormState = {
  nama_mitra: '',
  kategori_mitra: '',
  negara: 'Indonesia',
  website: '',
  alamat: '',
  email_mitra: '',
  telepon_mitra: '',
  nama_kontak_utama: '',
  jabatan_kontak_utama: '',
  email_kontak_utama: '',
  telepon_kontak_utama: '',
  aktif: true,
};

const kategoriOptions = ['Industri', 'Institusi Pendidikan', 'Instansi Pemerintah', 'Organisasi/Lembaga'] as const;
const wilayahOptions = ['Semua Wilayah', 'Dalam Negeri', 'Luar Negeri'] as const;

function getWilayahLabel(negara?: string | null): 'Dalam Negeri' | 'Luar Negeri' {
  return (negara || '').trim().toLowerCase() === 'indonesia' ? 'Dalam Negeri' : 'Luar Negeri';
}

export default function MasterMitraPage() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<MasterMitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua Kategori');
  const [filterWilayah, setFilterWilayah] = useState<(typeof wilayahOptions)[number]>('Semua Wilayah');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState<MasterMitra | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    let mounted = true;

    const loadRows = async () => {
      try {
        setError(null);
        const data = await getMasterMitra();
        if (mounted) {
          setRows(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Gagal memuat master mitra.');
          setRows([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRows();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const wilayahParam = (searchParams.get('wilayah') || '').trim().toLowerCase();
    const kategoriParam = (searchParams.get('kategori') || '').trim();
    const statusParam = (searchParams.get('status') || '').trim().toLowerCase();

    if (wilayahParam === 'dalam-negeri' || wilayahParam === 'dalam negeri') {
      setFilterWilayah('Dalam Negeri');
    } else if (wilayahParam === 'luar-negeri' || wilayahParam === 'luar negeri') {
      setFilterWilayah('Luar Negeri');
    } else if (kategoriParam === 'Dalam Negeri' || kategoriParam === 'Luar Negeri') {
      setFilterWilayah(kategoriParam);
    } else {
      setFilterWilayah('Semua Wilayah');
    }

    if (kategoriOptions.includes(kategoriParam as (typeof kategoriOptions)[number])) {
      setFilterKategori(kategoriParam);
    } else {
      setFilterKategori('Semua Kategori');
    }

    if (statusParam === 'aktif') {
      setFilterStatus('Aktif');
    } else if (statusParam === 'nonaktif' || statusParam === 'non-aktif') {
      setFilterStatus('NonAktif');
    } else {
      setFilterStatus('Semua Status');
    }
  }, [searchParams]);

  const openCreate = () => {
    setEditingRow(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: MasterMitra) => {
    setEditingRow(item);
    setForm({
      nama_mitra: item.nama_mitra,
      kategori_mitra: item.kategori_mitra || '',
      negara: item.negara || '',
      website: item.website || '',
      alamat: item.alamat || '',
      email_mitra: item.email_mitra || '',
      telepon_mitra: item.telepon_mitra || '',
      nama_kontak_utama: item.nama_kontak_utama || '',
      jabatan_kontak_utama: item.jabatan_kontak_utama || '',
      email_kontak_utama: item.email_kontak_utama || '',
      telepon_kontak_utama: item.telepon_kontak_utama || '',
      aktif: item.aktif,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setShowModal(false);
    setEditingRow(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.nama_mitra.trim()) {
      setError('Nama mitra wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        ...form,
        kategori_mitra: form.kategori_mitra.trim() || null,
        negara: form.negara.trim() || null,
        website: form.website.trim() || null,
        alamat: form.alamat.trim() || null,
        email_mitra: form.email_mitra.trim() || null,
        telepon_mitra: form.telepon_mitra.trim() || null,
        nama_kontak_utama: form.nama_kontak_utama.trim() || null,
        jabatan_kontak_utama: form.jabatan_kontak_utama.trim() || null,
        email_kontak_utama: form.email_kontak_utama.trim() || null,
        telepon_kontak_utama: form.telepon_kontak_utama.trim() || null,
      };

      const saved = editingRow
        ? await updateMasterMitra(editingRow.id, payload)
        : await createMasterMitra(payload);

      setRows((prev) => {
        if (editingRow) {
          return prev.map((item) => (item.id === editingRow.id ? saved : item));
        }

        return [saved, ...prev];
      });

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan master mitra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: MasterMitra) => {
    if (!confirm(`Yakin ingin menghapus mitra "${item.nama_mitra}"?`)) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await deleteMasterMitra(item.id);
      setRows((prev) => prev.filter((row) => row.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus master mitra.');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedRows = useMemo<GroupedMitraRow[]>(() => {
    const groups = new Map<string, MasterMitra[]>();

    for (const item of rows) {
      const key = item.nama_mitra.trim().toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(item);
    }

    return Array.from(groups.values()).map((group) => {
      const primary = group[0];
      const kategoriSet = new Set(group.map((item) => (item.kategori_mitra || '').trim()).filter(Boolean));
      const negaraSet = new Set(group.map((item) => (item.negara || '').trim()).filter(Boolean));
      const kontakMap = new Map<string, { nama: string; jabatan: string; email: string; telepon: string }>();

      for (const item of group) {
        const kontak = {
          nama: (item.nama_kontak_utama || '-').trim() || '-',
          jabatan: (item.jabatan_kontak_utama || '-').trim() || '-',
          email: (item.email_kontak_utama || item.email_mitra || '-').trim() || '-',
          telepon: (item.telepon_kontak_utama || item.telepon_mitra || '-').trim() || '-',
        };
        const key = `${kontak.nama}|${kontak.jabatan}|${kontak.email}|${kontak.telepon}`;
        if (!kontakMap.has(key)) {
          kontakMap.set(key, kontak);
        }
      }

      const hasDomestik = group.some((item) => getWilayahLabel(item.negara) === 'Dalam Negeri');
      const hasLuarNegeri = group.some((item) => getWilayahLabel(item.negara) === 'Luar Negeri');
      const negaraLabel =
        negaraSet.size <= 1
          ? (Array.from(negaraSet)[0] || primary.negara || '-')
          : 'Multi Negara';

      return {
        primary,
        nama_mitra: primary.nama_mitra,
        kategori_mitra: kategoriSet.size ? Array.from(kategoriSet).join(', ') : '-',
        negara: negaraLabel,
        email_mitra: group.map((item) => item.email_mitra).find((value) => Boolean(value)) || null,
        aktif: group.some((item) => item.aktif),
        groupCount: group.length,
        hasDomestik,
        hasLuarNegeri,
        kontakList: Array.from(kontakMap.values()),
      };
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return groupedRows.filter((item) => {
      const kontakText = item.kontakList
        .map((kontak) => `${kontak.nama} ${kontak.jabatan} ${kontak.email} ${kontak.telepon}`)
        .join(' ')
        .toLowerCase();

      const matchSearch =
        !keyword ||
        item.nama_mitra.toLowerCase().includes(keyword) ||
        (item.kategori_mitra || '').toLowerCase().includes(keyword) ||
        (item.negara || '').toLowerCase().includes(keyword) ||
        (item.email_mitra || '').toLowerCase().includes(keyword) ||
        kontakText.includes(keyword);
      const matchKategori =
        filterKategori === 'Semua Kategori' ||
        item.kategori_mitra.split(', ').includes(filterKategori) ||
        (filterKategori === 'Industri' && item.kategori_mitra.includes('Perusahaan'));
      const matchWilayah =
        filterWilayah === 'Semua Wilayah' ||
        (filterWilayah === 'Dalam Negeri' ? item.hasDomestik : item.hasLuarNegeri);
      const matchStatus = filterStatus === 'Semua Status' || (filterStatus === 'Aktif' ? item.aktif : !item.aktif);

      return matchSearch && matchKategori && matchWilayah && matchStatus;
    });
  }, [groupedRows, search, filterKategori, filterWilayah, filterStatus]);

  const summary = {
    total: groupedRows.length,
    aktif: groupedRows.filter((item) => item.aktif).length,
    domestik: groupedRows.filter((item) => item.hasDomestik).length,
    luarNegeri: groupedRows.filter((item) => item.hasLuarNegeri).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-bold text-gray-900">Data Kemitraan</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Kelola data referensi mitra kerja sama Polibatam</p>
        </div>

        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} />
          Tambah Mitra
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] text-red-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Building2} label="Total Mitra" value={summary.total} />
        <SummaryCard icon={Users} label="Mitra Aktif" value={summary.aktif} />
        <SummaryCard icon={Globe} label="Domestik" value={summary.domestik} />
        <SummaryCard icon={Globe} label="Luar Negeri" value={summary.luarNegeri} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, kategori, negara, atau email..."
            className="input-field w-full pl-9 pr-4 py-2.5 text-[12px]"
          />
        </div>

        <div className="relative min-w-[180px]">
          <select value={filterKategori} onChange={(event) => setFilterKategori(event.target.value)} className="input-field appearance-none pl-4 pr-9 py-2.5 text-[12px] font-medium">
            <option>Semua Kategori</option>
            {kategoriOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative min-w-[170px]">
          <select value={filterWilayah} onChange={(event) => setFilterWilayah(event.target.value as (typeof wilayahOptions)[number])} className="input-field appearance-none pl-4 pr-9 py-2.5 text-[12px] font-medium">
            {wilayahOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative min-w-[160px]">
          <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="input-field appearance-none pl-4 pr-9 py-2.5 text-[12px] font-medium">
            <option>Semua Status</option>
            <option>Aktif</option>
            <option>NonAktif</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="table-shell overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="table-head border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Mitra</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kategori</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Negara</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kontak Utama</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">Memuat data master mitra...</td>
                </tr>
              )}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">Tidak ada data ditemukan</td>
                </tr>
              )}

              {!loading && filteredRows.map((item) => (
                <tr key={`${item.primary.id}-${item.nama_mitra}`} className="border-b border-gray-100 transition hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.nama_mitra}</p>
                      <p className="text-[10px] text-gray-500">{item.email_mitra || '-'}</p>
                      {item.groupCount > 1 && (
                        <p className="text-[10.5px] font-semibold text-[#173B82]">{item.groupCount} data kontak digabung</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.kategori_mitra || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.negara || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="space-y-2">
                      {item.kontakList.map((kontak, index) => (
                        <div key={`${item.primary.id}-kontak-${index}`}>
                          <p className="font-medium text-gray-800">{kontak.nama}</p>
                          <p className="text-[10px] text-gray-500">{kontak.telepon}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold ${item.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {item.aktif ? 'Aktif' : 'NonAktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item.primary)} className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(item.primary)} disabled={submitting} className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50" title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">{editingRow ? 'Edit Master Mitra' : 'Tambah Master Mitra'}</h2>
                <p className="text-[12px] text-gray-500">Lengkapi data mitra kerja sama secara terstruktur</p>
              </div>
              <button onClick={closeModal} className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-500 transition hover:bg-gray-50">Tutup</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nama Mitra *">
                <input value={form.nama_mitra} onChange={(event) => setForm((prev) => ({ ...prev, nama_mitra: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" />
              </Field>
              <Field label="Kategori Mitra">
                <select
                  value={form.kategori_mitra}
                  onChange={(event) => setForm((prev) => ({ ...prev, kategori_mitra: event.target.value }))}
                  className="input-field w-full px-4 py-2.5 text-[12px]"
                >
                  <option value="">Pilih kategori mitra</option>
                  {kategoriOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Negara">
                <input value={form.negara} onChange={(event) => setForm((prev) => ({ ...prev, negara: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" />
                <p className="text-[10px] text-slate-500">Wilayah otomatis: {getWilayahLabel(form.negara)}</p>
              </Field>
              <Field label="Website">
                <input value={form.website} onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" placeholder="https://..." />
              </Field>
              <Field label="Email Mitra">
                <input type="email" value={form.email_mitra} onChange={(event) => setForm((prev) => ({ ...prev, email_mitra: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" />
              </Field>
              <Field label="Telepon Mitra">
                <input value={form.telepon_mitra} onChange={(event) => setForm((prev) => ({ ...prev, telepon_mitra: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Alamat">
                  <textarea value={form.alamat} onChange={(event) => setForm((prev) => ({ ...prev, alamat: event.target.value }))} className="input-field min-h-24 w-full px-4 py-2.5 text-[12px]" />
                </Field>
              </div>

              <div className="md:col-span-2 border-t border-gray-100 pt-4">
                <p className="mb-3 text-[12px] font-semibold text-gray-700">Kontak Utama</p>
              </div>
              <Field label="Nama Kontak Utama">
                <input value={form.nama_kontak_utama} onChange={(event) => setForm((prev) => ({ ...prev, nama_kontak_utama: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" />
              </Field>
              <Field label="Jabatan Kontak Utama">
                <input value={form.jabatan_kontak_utama} onChange={(event) => setForm((prev) => ({ ...prev, jabatan_kontak_utama: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" />
              </Field>
              <Field label="Email Kontak Utama">
                <input type="email" value={form.email_kontak_utama} onChange={(event) => setForm((prev) => ({ ...prev, email_kontak_utama: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" />
              </Field>
              <Field label="Telepon Kontak Utama">
                <input value={form.telepon_kontak_utama} onChange={(event) => setForm((prev) => ({ ...prev, telepon_kontak_utama: event.target.value }))} className="input-field w-full px-4 py-2.5 text-[12px]" />
              </Field>

              <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">Status aktif</p>
                  <p className="text-[10px] text-gray-500">Tandai apakah mitra ini masih digunakan di sistem</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, aktif: !prev.aktif }))}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-[12px] font-semibold ${form.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                >
                  {form.aktif ? 'Aktif' : 'NonAktif'}
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button onClick={closeModal} className="rounded-lg border border-gray-200 px-4 py-2.5 text-[12px] font-medium text-gray-700 transition hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSave} disabled={submitting} className="btn-primary px-4 py-2.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100">
          <Icon size={18} className="text-sky-700" />
        </div>
        <p className="text-[12px] font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-[17px] font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-[12px] font-medium text-gray-700">
      <span>{label}</span>
      {children}
    </label>
  );
}