import React from "react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#6366f1", "#06b6d4", "#f97316", "#10b981", "#e11d48"];

const printData = [
  { month: "Jan", count: 120 },
  { month: "Feb", count: 90 },
  { month: "Mar", count: 40 },
  { month: "Apr", count: 70 },
  { month: "May", count: 25 },
  { month: "Jun", count: 100 },
  { month: "Jul", count: 110 },
  { month: "Aug", count: 120 },
  { month: "Sep", count: 130 },
  { month: "Oct", count: 150 },
  { month: "Nov", count: 140 },
  { month: "Dec", count: 160 },
];

const sectionData = [
  { name: "Math", value: 300 },
  { name: "Science", value: 200 },
  { name: "Letters", value: 100 },
  { name: "Economics", value: 150 },
  { name: "Computer Science", value: 250 },
];

const Analyse: React.FC = () => {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Prints par Mois</h2>
          <button className="text-sm text-blue-500 hover:underline">Sync</button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={printData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Répartition par Section</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sectionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              label
            >
              {sectionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analyse;
