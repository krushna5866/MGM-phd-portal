import { Search, Download, Award } from 'lucide-react';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function MeritList() {
  const [meritData, setMeritData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeritData = async () => {
      try {
        const [appRes, userRes] = await Promise.all([
          api.get('/applications/'),
          api.get('/users/')
        ]);

        const completedApps = appRes.data.filter((app: any) => app.current_level === 'ADMISSION_COMPLETE' && app.total_merit_score);
        
        const mergedData = completedApps.map((app: any) => {
          const student = userRes.data.find((u: any) => u._id === app.studentId);
          return {
            id: app._id,
            name: student?.name || 'Unknown',
            dept: student?.department || 'N/A',
            pet: app.pet_merit_weightage,
            fwc: app.fwc_merit_weightage,
            total: app.total_merit_score
          };
        });

        // Sort descending by total
        mergedData.sort((a: any, b: any) => b.total - a.total);
        
        // Assign ranks
        mergedData.forEach((item: any, index: number) => {
          item.rank = index + 1;
        });

        setMeritData(mergedData);
      } catch (e) {
        console.error("Failed to fetch merit list", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMeritData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-mgmu-blue">Ph.D. Merit List 2026</h2>
          <p className="text-gray-500">Based on PET (70%) and FWC (30%) scores</p>
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download Full List</span>
        </button>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by name or department..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg">
            <option>All Departments</option>
            <option>CSE</option>
            <option>Mechanical</option>
            <option>Management</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-mgmu-blue text-white text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4 rounded-tl-lg">Rank</th>
                <th className="px-6 py-4">Scholar Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">PET (70)</th>
                <th className="px-6 py-4">FWC (30)</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="p-4 text-center text-gray-500">Loading Merit List...</td></tr>
              ) : meritData.length > 0 ? meritData.map((item) => (
                <tr key={item.id} className={item.rank <= 3 ? 'bg-mgmu-gold/5' : ''}>
                  <td className="px-6 py-4">
                    {item.rank <= 3 ? (
                      <div className="flex items-center space-x-1">
                        <Award className={`h-4 w-4 ${item.rank === 1 ? 'text-yellow-500' : item.rank === 2 ? 'text-gray-400' : 'text-orange-400'}`} />
                        <span className="font-bold">#{item.rank}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">#{item.rank}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-mgmu-blue">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.dept}</td>
                  <td className="px-6 py-4 text-sm">{item.pet.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{item.fwc.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-mgmu-blue">{item.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Provisionally Selected</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="p-4 text-center text-gray-500">No applicants have completed the admission process yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
