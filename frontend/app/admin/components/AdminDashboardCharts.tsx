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
  return (
    <>
      <div className="card p-6 md:p-8">
        <h2 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-8">STATISTIK KERJASAMA</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionalDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
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
            <p className="text-sm text-gray-600 mt-4">Distribusi Kerjasama Berdasarkan Wilayah</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={documentTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
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
            <p className="text-sm text-gray-600 mt-4">Distribusi Jenis Dokumen</p>
          </div>
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Top 5 Ruang Lingkup Paling Sering Diajukan</h2>
        <p className="text-sm text-gray-600 mb-6">Berdasarkan data pengajuan dalam 1 tahun terakhir.</p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={popularSchemes} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }} />
            <Bar dataKey="value" fill="#173B82" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
