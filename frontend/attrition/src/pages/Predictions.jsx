import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/client'

export default function Predictions() {
  const [empId, setEmpId] = useState('')
  const [result, setResult] = useState(null)
  const [survival, setSurvival] = useState(null)
  const [shap, setShap] = useState(null)
  const [loading, setLoading] = useState(false)

  const predict = async () => {
    if (!empId) return
    setLoading(true)
    try {
      const [p, s, e] = await Promise.all([
        api.post(`/predictions/predict/${empId}`),
        api.get(`/predictions/survival/${empId}`),
        api.get(`/predictions/explain/${empId}`)
      ])
      setResult(p.data)
      setSurvival(s.data)
      setShap(e.data)
    } catch (err) {
      alert('Employee not found or prediction failed')
    }
    setLoading(false)
  }

  const riskColor = r => r === 'High' ? 'text-red-500' : r === 'Medium' ? 'text-amber-500' : 'text-green-500'

  return (
    <div className="p-6 flex flex-col gap-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-800 dark:text-white">Predictions</h1>
        <p className="text-[13px] text-slate-500 dark:text-gray-400 mt-0.5">Run XGBoost + Cox survival analysis per employee</p>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
        <p className="text-[13px] font-medium text-slate-700 dark:text-gray-200 mb-3">Enter employee ID</p>
        <div className="flex gap-3">
          <input
            value={empId}
            onChange={e => setEmpId(e.target.value)}
            placeholder="e.g. 1"
            className="flex-1 px-4 py-2 text-[13px] bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={predict}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Predict'}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
            <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">Prediction</p>
            <p className="text-[15px] font-semibold text-slate-800 dark:text-white">{result.prediction}</p>
            <p className={`text-2xl font-bold mt-2 ${riskColor(result.risk_level)}`}>{(result.attrition_probability * 100).toFixed(1)}%</p>
            <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">Risk: {result.risk_level}</p>
          </div>

          {shap && (
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">Top SHAP factors</p>
              <div className="flex flex-col gap-3">
                {shap['Explanation(Top 3 Factors)']?.map((f, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-slate-600 dark:text-gray-300">{f.factor}</span>
                      <span className="text-slate-400 dark:text-gray-500">{f.importance.toFixed(3)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(f.importance * 300, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {survival && (
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">12-month timeline</p>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 mb-3">12-month attrition risk: <span className={`font-semibold ${riskColor(result.risk_level)}`}>{(survival.overall_12month_risk * 100).toFixed(1)}%</span></p>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={survival.survival_timeline?.map(t => ({ month: `M${t.month}`, risk: +(t.attrition_risk * 100).toFixed(1) }))}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={v => [`${v}%`, 'Risk']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={1.5} fill="url(#sg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
