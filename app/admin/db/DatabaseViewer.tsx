"use client"

import { useState } from "react"

function renderCell(value: any) {
  if (value === null || value === undefined) return "—"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export default function DatabaseViewer({
  data,
}: {
  data: Record<string, any[]>
}) {
  // ✅ DEFAULT JSON VIEW
  const [view, setView] = useState<"table" | "json">("json")

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📦 Database Viewer</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setView("json")}
            className={`px-3 py-1.5 rounded text-sm border ${
              view === "json" ? "bg-muted" : ""
            }`}
          >
            JSON View
          </button>

          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 rounded text-sm border ${
              view === "table" ? "bg-muted" : ""
            }`}
          >
            Table View
          </button>

          <a
            href="/api/admin/export-db"
            className="px-4 py-2 bg-black text-white rounded-md text-sm"
          >
            Download JSON
          </a>
        </div>
      </div>

      {/* ================= JSON VIEW ================= */}
      {view === "json" && (
        <div className="space-y-6">
          {Object.entries(data).map(([collection, docs]) => (
            <div
              key={collection}
              className="border rounded-lg p-4 space-y-3"
            >
              {/* Collection Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">
                  📁 {collection}
                </h2>
                <span className="text-sm opacity-70">
                  {docs.length} items
                </span>
              </div>

              {/* JSON Block */}
              <pre className="text-xs overflow-auto max-h-[400px] bg-muted p-4 rounded">
                {JSON.stringify(docs, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* ================= TABLE VIEW ================= */}
      {view === "table" &&
        Object.entries(data).map(([collection, docs]) => {
          if (docs.length === 0) return null
          const columns = Object.keys(docs[0])

          return (
            <div
              key={collection}
              className="border rounded-lg p-4 space-y-3"
            >
              <h2 className="font-semibold text-lg">
                📁 {collection} ({docs.length})
              </h2>

              <div className="overflow-auto max-h-[500px] border rounded">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="border px-3 py-2 text-left whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {docs.map((doc, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        {columns.map((col) => (
                          <td
                            key={col}
                            className="border px-3 py-2 max-w-[300px] truncate"
                            title={renderCell(doc[col])}
                          >
                            {renderCell(doc[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
    </div>
  )
}
