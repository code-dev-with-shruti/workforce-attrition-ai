import { useState, useRef } from 'react'
import { Upload as UploadIcon, FileText, CheckCircle } from 'lucide-react'
import api from '../api/client'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => { setFile(f); setDone(false) }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      await api.post('/employees/upload-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setDone(true)
    } catch {
      alert('Upload failed — check that your CSV columns match the expected format.')
    }
    setUploading(false)
  }

  return (
    <div className="p-6 flex flex-col gap-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-800 dark:text-white">Upload CSV</h1>
        <p className="text-[13px] text-slate-500 dark:text-gray-400 mt-0.5">Upload your company's employee data for attrition analysis</p>
      </div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        className="border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all"
      >
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
          <UploadIcon size={22} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-slate-700 dark:text-gray-200">Drop your CSV here or click to browse</p>
          <p className="text-[12px] text-slate-400 dark:text-gray-500 mt-1">Supports .csv files — columns must match IBM HR format</p>
        </div>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
      </div>
      {file && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-slate-700 dark:text-gray-200 truncate">{file.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          {done
            ? <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[12px] font-medium"><CheckCircle size={15} /> Uploaded</div>
            : <button onClick={upload} disabled={uploading} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded-lg transition-colors disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
          }
        </div>
      )}
      <div className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-4">
        <p className="text-[12px] font-medium text-slate-600 dark:text-gray-300 mb-2">Required CSV columns</p>
        <div className="flex flex-wrap gap-1.5">
          {['Age','Department','JobRole','MonthlyIncome','OverTime','JobSatisfaction','WorkLifeBalance','YearsAtCompany','DistanceFromHome','Gender','BusinessTravel','MaritalStatus','EducationField'].map(c => (
            <span key={c} className="text-[11px] px-2 py-0.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded text-slate-600 dark:text-gray-300">{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
