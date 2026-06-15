import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import api from '../api/client'

const badge = (risk) => {
  const map = {
    High: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
    Medium: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    Low: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
  }
  return map[risk] || 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/employees/').then(r => { setEmployees(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = employees.filter(e =>
    e.Department?.toLowerCase().includes(search.toLowerCase()) ||
    e.JobRole?.toLowerCase().includes(search.toLowerCase()) ||
    String(e.id).includes(search)
  )

  return (
    <div className="p-6 flex flex-col gap-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-800 dark:text-white">Employees</h1>
          <p className="text-[13px] text-slate-500 dark:text-gray-400 mt-0.5">{employees.length} employees loaded</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search department, role..."
            className="pl-8 pr-4 py-2 text-[13px] bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-slate-400 dark:text-gray-500">Loading employees...</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
                {['ID', 'Age', 'Department', 'Job Role', 'Income', 'Overtime', 'Risk', 'Probability'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((emp, i) => (
                <tr key={emp.id} className={`border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-gray-900/50'}`}>
                  <td className="px-4 py-3 text-slate-500 dark:text-gray-400">#{emp.id}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-gray-200">{emp.Age}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-gray-200">{emp.Department}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-gray-200">{emp.JobRole}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-gray-200">${emp.MonthlyIncome?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${emp.OverTime === 'Yes' ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'}`}>
                      {emp.OverTime}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {emp.Risk_Level ? (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badge(emp.Risk_Level)}`}>{emp.Risk_Level}</span>
                    ) : <span className="text-slate-300 dark:text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-gray-200">
                    {emp.Attrition_Probability ? `${(emp.Attrition_Probability * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
