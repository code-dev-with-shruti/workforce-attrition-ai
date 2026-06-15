import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import api from '../api/client'

const QUICK = [
  'Who are the top 5 flight risk employees?',
  'Which department has the highest attrition?',
  'What are the main drivers of attrition?',
]

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m the AttriSense AI assistant. Ask me anything about your workforce — like "What if we give employee #5 a raise?" or "Which department needs attention most?"' }
  ])
  const [input, setInput] = useState('')
  const [empId, setEmpId] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const q = text || input.trim()
    if (!q) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await api.post('/chat/ask/' + (empId || '1'), null, { params: { question: q } })
      setMessages(m => [...m, { role: 'ai', text: res.data.recommendation }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Could not reach the AI backend. Make sure the FastAPI server is running.' }])
    }
    setLoading(false)
  }

  return (
    <div className="p-6 flex flex-col gap-4 max-w-3xl mx-auto h-screen">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-800 dark:text-white">AI Assistant</h1>
        <p className="text-[13px] text-slate-500 dark:text-gray-400 mt-0.5">Ask anything about employee retention</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-[12px] text-slate-500 dark:text-gray-400">Employee ID (optional):</label>
        <input
          value={empId}
          onChange={e => setEmpId(e.target.value)}
          placeholder="e.g. 5"
          className="w-24 px-3 py-1.5 text-[13px] bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} className="text-[11px] px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
            {q}
          </button>
        ))}
      </div>
      <div className="flex-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-3 overflow-y-auto min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'ai' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-gray-700'}`}>
              {m.role === 'ai' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-slate-600 dark:text-gray-300" />}
            </div>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-xl text-[13px] leading-relaxed ${
              m.role === 'ai'
                ? 'bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200'
                : 'bg-blue-600 text-white'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-slate-50 dark:bg-gray-800 px-4 py-2.5 rounded-xl flex gap-1 items-center">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about an employee or department..."
          className="flex-1 px-4 py-2.5 text-[13px] bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors">
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  )
}
