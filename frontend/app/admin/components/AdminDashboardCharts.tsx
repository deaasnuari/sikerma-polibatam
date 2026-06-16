'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ChartDatum = {
  name: string;
  value: number;
  fill?: string;
};

type Props = {
  regionalDistribution: ChartDatum[];
  documentTypeDistribution: ChartDatum[];
  popularSchemes: ChartDatum[];
};

export default function AdminDashboardCharts({
  regionalDistribution,
  documentTypeDistribution,
  popularSchemes,
}: Props) {
  const handleExportRegionalDistribution = () => {
    const header = ['Wilayah', 'Jumlah Kerjasama'];
    const rows = regionalDistribution.map((item) => [item.name, String(item.value)]);

    const content = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join('\t'))
      .join('\n');

    const blob = new Blob(['\ufeff', content], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `distribusi-kerjasama-wilayah-${dateStamp}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="card p-3 md:p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-sm md:text-base font-bold text-gray-900">Statistik Kerjasama</h2>
          <button
            type="button"
            onClick={handleExportRegionalDistribution}
            className="inline-flex items-center justify-center rounded-lg bg-[#173B82] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#091222]"
          >
            Export Dalam/Luar Negeri
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={regionalDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionalDistribution.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">Distribusi Kerjasama Berdasarkan Wilayah</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={documentTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {documentTypeDistribution.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">Distribusi Jenis Dokumen</p>
          </div>
        </div>
      </div>

      <div className="card p-3 md:p-5">
        <h2 className="text-sm md:text-base font-bold text-gray-900 mb-1">Top 5 Ruang Lingkup Paling Sering Diajukan</h2>
        <p className="text-xs text-gray-500 mb-4">Berdasarkan data pengajuan dalam 1 tahun terakhir.</p>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={popularSchemes} margin={{ top: 10, right: 20, left: 0, bottom: 55 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" angle={-40} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: 12 }} />
            <Bar dataKey="value" fill="#173B82" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
