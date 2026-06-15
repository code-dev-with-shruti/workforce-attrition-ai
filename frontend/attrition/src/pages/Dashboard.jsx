import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { Users, AlertTriangle, ShieldCheck, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../api/client'

const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' }

const deptData = [
  { dept: 'Sales', high: 62, medium: 21, low: 17 },
  { dept: 'HR', high: 48, medium: 28, low: 24 },
  { dept: 'R&D', high: 31, medium: 35, low: 34 },
  { dept: 'Finance', high: 18, medium: 30, low: 52 },
  { dept: 'Legal', high: 11, medium: 22, low: 67 },
]

const pieData = [
  { name: 'High', value: 237 },
  { name: 'Medium', value: 341 },
  { name: 'Low', value: 892 },
]

const survivalData = [
  { month: 'M1', risk: 8 }, { month: 'M2', risk: 14 }, { month: 'M3', risk: 21 },
  { month: 'M4', risk: 29 }, { month: 'M5', risk: 36 }, { month: 'M6', risk: 43 },
  { month: 'M7', risk: 49 }, { month: 'M8', risk: 55 }, { month: 'M9', risk: 61 },
  { month: 'M10', risk: 66 }, { month: 'M11', risk: 71 }, { month: 'M12', risk: 75 },
]

const carouselSlides = [
  { title: 'Sales dept has highest flight risk', subtitle: '62% of Sales employees are flagged High risk this month', accent: 'bg-red-500', stat: '62%', statLabel: 'High risk in Sales' },
  { title: 'Overtime is the #1 attrition driver', subtitle: 'SHAP analysis shows overtime contributes 0.31 impact score across all employees', accent: 'bg-blue-600', stat: '0.31', statLabel: 'SHAP impact score' },
  { title: '237 employees need immediate attention', subtitle: 'High risk employees represent 16% of total workforce', accent: 'bg-amber-500', stat: '237', statLabel: 'High risk employees' },
]

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-slate-500 dark:text-gray-400">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={14} className="text-white" />
        </div>
      </div>
      <span className="text-2xl font-semibold text-slate-800 dark:text-white">{value}</span>
      <span className="text-[11px] text-slate-400 dark:text-gray-500">{sub}</span>
    </div>
  )
}

function Carousel() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const next = () => setCurrent(c => (c + 1) % carouselSlides.length)
  const prev = () => setCurrent(c => (c - 1 + carouselSlides.length) % carouselSlides.length)
  useEffect(() => {
    timerRef.current = setInterval(next, 4000)
    return () => clearInterval(timerRef.current)
  }, [])
  const slide = carouselSlides[current]
  return (
    <div className="relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className={`h-1 w-full ${slide.accent} transition-all duration-500`} />
      <div className="flex items-center gap-6 px-6 py-5">
        <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-slate-50 dark:bg-gray-800 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">{slide.stat}</span>
          <span className="text-[9px] text-slate-500 dark:text-gray-400 text-center leading-tight mt-0.5 px-1">{slide.statLabel}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-slate-800 dark:text-white leading-snug">{slide.title}</p>
          <p className="text-[12px] text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">{slide.subtitle}</p>
        </div>
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button onClick={prev} className="w-7 h-7 rounded-full border border-slate-200 dark:border-gray-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft size={13} className="text-slate-500 dark:text-gray-400" />
          </button>
          <button onClick={next} className="w-7 h-7 rounded-full border border-slate-200 dark:border-gray-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight size={13} className="text-slate-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <div className="flex justify-center gap-1.5 pb-3">
        {carouselSlides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300 dark:bg-gray-700'}`} />
        ))}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2 text-[12px] shadow-lg">
        <p className="font-medium text-slate-700 dark:text-gray-200 mb-1">{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.fill }}>{p.name}: {p.value}%</p>)}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 1470, high_risk: 237, medium_risk: 341, low_risk: 892 })
  useEffect(() => {
    api.post('/predictions/predict_all').then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div className="p-6 flex flex-col gap-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-[13px] text-slate-500 dark:text-gray-400 mt-0.5">Workforce attrition overview — AttriSense</p>
      </div>
      <Carousel />
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total employees" value={(stats.total || 1470).toLocaleString()} sub="IBM HR dataset" color="bg-blue-600" />
        <StatCard icon={AlertTriangle} label="High risk" value={stats.high_risk || 237} sub="16.1% of workforce" color="bg-red-500" />
        <StatCard icon={TrendingUp} label="Medium risk" value={stats.medium_risk || 341} sub="23.2% of workforce" color="bg-amber-500" />
        <StatCard icon={ShieldCheck} label="Low risk" value={stats.low_risk || 892} sub="60.7% of workforce" color="bg-green-500" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
          <p className="text-[12px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4">Attrition risk by department</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} barSize={14}>
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="high" name="High" fill="#ef4444" radius={[3,3,0,0]} />
              <Bar dataKey="medium" name="Medium" fill="#f59e0b" radius={[3,3,0,0]} />
              <Bar dataKey="low" name="Low" fill="#22c55e" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
          <p className="text-[12px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4">Risk split</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                {pieData.map(entry => <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} employees`, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: RISK_COLORS[d.name] }} />
                  <span className="text-slate-500 dark:text-gray-400">{d.name}</span>
                </div>
                <span className="font-medium text-slate-700 dark:text-gray-200">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
          <p className="text-[12px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Average flight risk timeline (12 months)</p>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mb-4">Cox survival model — probability of attrition by month</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={survivalData}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Attrition risk']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} fill="url(#riskGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
          <p className="text-[12px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4">Top flight risks</p>
          <div className="flex flex-col gap-3">
            {[
              { name: 'Emily Watson', dept: 'Sales', prob: 83 },
              { name: 'Priya Sharma', dept: 'Sales', prob: 78 },
              { name: 'Sarah Chen', dept: 'HR', prob: 71 },
              { name: 'Arjun Mehta', dept: 'R&D', prob: 41 },
              { name: 'Rohan Nair', dept: 'Finance', prob: 12 },
            ].map((emp, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold flex-shrink-0">
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-700 dark:text-gray-200 truncate">{emp.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500">{emp.dept}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  emp.prob > 60 ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400' :
                  emp.prob > 35 ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400' :
                  'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                }`}>{emp.prob}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
