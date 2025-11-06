'use client'

import { useState } from 'react'
import DocumentForm from './components/DocumentForm'
import DocumentPreview from './components/DocumentPreview'
import { DocumentData, LineItem, TaxItem } from './types'

export default function Home() {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null)

  const handleGenerate = (data: DocumentData) => {
    setDocumentData(data)
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Design Arena Finance Generator
          </h1>
          <p className="text-gray-600">
            Create professional invoices, quotations, and bills
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <DocumentForm onGenerate={handleGenerate} />
          </div>

          <div className="sticky top-8 self-start">
            {documentData && <DocumentPreview data={documentData} />}
          </div>
        </div>
      </div>
    </main>
  )
}
