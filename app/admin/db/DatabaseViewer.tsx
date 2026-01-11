"use client"

import { useState } from "react"

interface Props {
  collections: string[]
}

export default function DatabaseViewer({ collections }: Props) {
  const [activeCol, setActiveCol] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"table" | "raw">("table")
  const [limit, setLimit] = useState(50)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function loadCollection(name: string, customLimit = limit) {
    setActiveCol(name)
    setLoading(true)
    setData([])
    setSidebarOpen(false) // mobile auto close

    try {
      const res = await fetch(
        `/api/admin/collection?name=${name}&limit=${customLimit}`
      )
      const json = await res.json()
      setData(json.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    if (!data.length || !activeCol) return

    const headers = Object.keys(data[0])
    const rows = data.map((row) =>
      headers.map((h) =>
        `"${String(
          typeof row[h] === "object"
            ? JSON.stringify(row[h])
            : row[h] ?? ""
        ).replace(/"/g, '""')}"`
      )
    )

    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${activeCol}.csv`
    a.click()

    URL.revokeObjectURL(url)
  }

  const columns =
    data.length > 0 ? Object.keys(data[0]).slice(0, 8) : []

  return (
    <div className="relative flex h-screen">
      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Database Viewer</h2>
          <button
            onClick={() => setSidebarOpen(true)}
            className="border px-3 py-1 rounded text-sm"
          >
            Collections
          </button>
        </div>

        {!activeCol && (
          <p className="text-gray-500">
            👉 Collection select karo
          </p>
        )}

        {activeCol && (
          <div className="flex justify-between items-center mb-3 gap-3 flex-wrap">
            <h2 className="font-bold">
              {activeCol} (latest {data.length})
            </h2>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value)
                  setLimit(newLimit)
                  loadCollection(activeCol, newLimit)
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>

              <button
                onClick={() => setView("table")}
                className={`px-3 py-1 rounded text-sm ${
                  view === "table"
                    ? "bg-black text-white"
                    : "border"
                }`}
              >
                Table
              </button>

              <button
                onClick={() => setView("raw")}
                className={`px-3 py-1 rounded text-sm ${
                  view === "raw"
                    ? "bg-black text-white"
                    : "border"
                }`}
              >
                Raw
              </button>

              <button
                onClick={exportCSV}
                className="px-3 py-1 rounded text-sm border"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}

        {loading && <p>Loading data...</p>}

        {!loading && view === "table" && data.length > 0 && (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left border-b"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b">
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 whitespace-nowrap"
                      >
                        {typeof row[col] === "object"
                          ? JSON.stringify(row[col])
                          : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && view === "raw" && (
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside
        className={`w-64 border-l p-4 overflow-auto bg-white
        fixed md:static top-0 right-0 h-full z-40
        transform transition-transform duration-300
        ${
          sidebarOpen
            ? "translate-x-0"
            : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-3 md:hidden">
          <h2 className="font-bold text-lg">Collections</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-sm border px-2 py-1 rounded"
          >
            Close
          </button>
        </div>

        <h2 className="font-bold text-lg mb-3 hidden md:block">
          Collections
        </h2>

        {collections.map((col) => (
          <button
            key={col}
            onClick={() => loadCollection(col)}
            className={`w-full text-left px-3 py-2 rounded text-sm mb-1
              ${
                activeCol === col
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }
            `}
          >
            {col}
          </button>
        ))}
      </aside>
    </div>
  )
}
