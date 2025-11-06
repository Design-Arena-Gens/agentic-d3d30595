'use client'

import { useEffect, useRef, useState } from 'react'
import { DocumentData } from '../types'
import { calculateDocument, formatCurrency, formatDate } from '../utils/calculations'
//@ts-ignore
import QRCode from 'qrcode'

interface Props {
  data: DocumentData
}

export default function DocumentPreview({ data }: Props) {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)
  const calculations = calculateDocument(data)

  useEffect(() => {
    if (data.outputs.show_qr && data.bank_details.upi_id) {
      const upiString = `upi://pay?pa=${data.bank_details.upi_id}&pn=${encodeURIComponent(data.company.name)}&am=${calculations.grand_total}&cu=INR`
      QRCode.toDataURL(upiString, { width: 150 })
        .then((url: string) => setQrCodeUrl(url))
        .catch((err: any) => console.error(err))
    }
  }, [data, calculations.grand_total])

  const downloadPDF = async () => {
    if (typeof window !== 'undefined') {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      if (previewRef.current) {
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        })

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 0

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
        pdf.save(`${data.doc_no}.pdf`)
      }
    }
  }

  const downloadJSON = () => {
    const output = {
      ...data,
      calculations
    }
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.doc_no}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadMarkdown = () => {
    let md = `# ${data.document_type.toUpperCase()}\n\n`
    md += `**${data.company.name}**\n`
    if (data.company.tagline) md += `*${data.company.tagline}*\n\n`
    md += `${data.company.address}\n`
    md += `${data.company.email} | ${data.company.phone}\n`
    if (data.company.website) md += `${data.company.website}\n`
    if (data.company.gst) md += `GST: ${data.company.gst}\n`

    md += `\n---\n\n`
    md += `**${data.document_type.toUpperCase()} NO:** ${data.doc_no}\n`
    md += `**DATE:** ${formatDate(data.doc_date)}\n`
    if (data.due_date) md += `**DUE DATE:** ${formatDate(data.due_date)}\n`
    if (data.valid_until) md += `**VALID UNTIL:** ${formatDate(data.valid_until)}\n`

    md += `\n## Bill To\n\n`
    md += `**${data.bill_to.name}**\n`
    md += `${data.bill_to.address}\n`
    md += `${data.bill_to.email} | ${data.bill_to.phone}\n`
    if (data.bill_to.gst) md += `GST: ${data.bill_to.gst}\n`

    md += `\n## Line Items\n\n`
    md += `| # | Description | HSN/SAC | Qty | Rate | Tax | Amount |\n`
    md += `|---|-------------|---------|-----|------|-----|--------|\n`

    calculations.line_items.forEach((item, i) => {
      md += `| ${i + 1} | ${item.description} | ${item.hsn_sac || '-'} | ${item.quantity} ${item.unit} | ${formatCurrency(item.unit_price)} | ${item.tax.map(t => `${t.name} ${t.rate}%`).join(', ')} | ${formatCurrency(item.total)} |\n`
    })

    md += `\n## Summary\n\n`
    md += `**Subtotal:** ${formatCurrency(calculations.subtotal)}\n`
    if (calculations.total_discount > 0) md += `**Discount:** -${formatCurrency(calculations.total_discount)}\n`
    Object.entries(calculations.tax_breakdown).forEach(([name, amount]) => {
      md += `**${name}:** ${formatCurrency(amount)}\n`
    })
    if (calculations.shipping > 0) md += `**Shipping:** ${formatCurrency(calculations.shipping)}\n`
    if (calculations.additional_charges_total > 0) md += `**Additional Charges:** ${formatCurrency(calculations.additional_charges_total)}\n`
    if (calculations.rounding_adjustment !== 0) md += `**Round Off:** ${formatCurrency(calculations.rounding_adjustment)}\n`
    md += `\n**GRAND TOTAL:** ${formatCurrency(calculations.grand_total)}\n`

    if (data.outputs.show_amount_in_words) {
      md += `\n*${calculations.amount_in_words}*\n`
    }

    if (data.notes) {
      md += `\n## Notes\n\n${data.notes}\n`
    }

    if (data.terms.length > 0) {
      md += `\n## Terms & Conditions\n\n`
      data.terms.forEach(term => {
        md += `- ${term}\n`
      })
    }

    md += `\n## Bank Details\n\n`
    md += `**Account Name:** ${data.bank_details.account_name}\n`
    md += `**Bank:** ${data.bank_details.bank}\n`
    md += `**Account No:** ${data.bank_details.account_no}\n`
    md += `**IFSC:** ${data.bank_details.ifsc}\n`
    if (data.bank_details.upi_id) md += `**UPI ID:** ${data.bank_details.upi_id}\n`

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.doc_no}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDocumentTitle = () => {
    switch (data.document_type) {
      case 'invoice':
        return 'INVOICE'
      case 'quotation':
        return 'QUOTATION'
      case 'bill':
        return 'BILL'
      default:
        return 'DOCUMENT'
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 no-print">
        <button
          onClick={downloadPDF}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
        >
          Download PDF
        </button>
        <button
          onClick={downloadMarkdown}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-semibold"
        >
          Download MD
        </button>
        <button
          onClick={downloadJSON}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-semibold"
        >
          Download JSON
        </button>
      </div>

      {/* Document Preview */}
      <div ref={previewRef} className="document-preview p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{data.company.name}</h1>
              {data.company.tagline && (
                <p className="text-gray-600 italic mt-1">{data.company.tagline}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-2">{getDocumentTitle()}</div>
              <div className="text-sm text-gray-600">
                <div className="font-semibold">{data.doc_no}</div>
                <div>Date: {formatDate(data.doc_date)}</div>
                {data.due_date && <div>Due: {formatDate(data.due_date)}</div>}
                {data.valid_until && <div>Valid Until: {formatDate(data.valid_until)}</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
              <div className="text-gray-700">
                <div>{data.company.address}</div>
                <div>{data.company.email}</div>
                <div>{data.company.phone}</div>
                {data.company.website && <div>{data.company.website}</div>}
                {data.company.gst && <div>GST: {data.company.gst}</div>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
              <div className="text-gray-700">
                <div className="font-semibold">{data.bill_to.name}</div>
                <div>{data.bill_to.address}</div>
                <div>{data.bill_to.email}</div>
                <div>{data.bill_to.phone}</div>
                {data.bill_to.gst && <div>GST: {data.bill_to.gst}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left py-3 px-2 font-semibold">#</th>
                <th className="text-left py-3 px-2 font-semibold">Description</th>
                <th className="text-left py-3 px-2 font-semibold">HSN/SAC</th>
                <th className="text-right py-3 px-2 font-semibold">Qty</th>
                <th className="text-right py-3 px-2 font-semibold">Rate</th>
                <th className="text-right py-3 px-2 font-semibold">Tax</th>
                <th className="text-right py-3 px-2 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {calculations.line_items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-2">{index + 1}</td>
                  <td className="py-3 px-2">{item.description}</td>
                  <td className="py-3 px-2">{item.hsn_sac || '-'}</td>
                  <td className="text-right py-3 px-2">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="text-right py-3 px-2">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right py-3 px-2 text-xs">
                    {item.tax.map((t) => (
                      <div key={t.name}>
                        {t.name} {t.rate}%
                      </div>
                    ))}
                  </td>
                  <td className="text-right py-3 px-2 font-semibold">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-96">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(calculations.subtotal)}</span>
              </div>
              {calculations.total_discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(calculations.total_discount)}</span>
                </div>
              )}
              {Object.entries(calculations.tax_breakdown).map(([name, amount]) => (
                <div key={name} className="flex justify-between">
                  <span className="text-gray-700">{name}:</span>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
              ))}
              {calculations.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipping:</span>
                  <span className="font-semibold">{formatCurrency(calculations.shipping)}</span>
                </div>
              )}
              {calculations.additional_charges_total > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Additional Charges:</span>
                  <span className="font-semibold">
                    {formatCurrency(calculations.additional_charges_total)}
                  </span>
                </div>
              )}
              {calculations.rounding_adjustment !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Round Off:</span>
                  <span className="font-semibold">
                    {formatCurrency(calculations.rounding_adjustment)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                <span className="text-lg font-bold">GRAND TOTAL:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculations.grand_total)}
                </span>
              </div>
            </div>
            {data.outputs.show_amount_in_words && (
              <div className="mt-3 text-xs text-gray-600 italic">
                {calculations.amount_in_words}
              </div>
            )}
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            {data.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                <p className="text-gray-700">{data.notes}</p>
              </div>
            )}
          </div>
          <div>
            {data.terms.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
                <ul className="text-gray-700 list-disc list-inside space-y-1">
                  {data.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bank Details & QR */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-start">
            <div className="text-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Bank Details:</h3>
              <div className="text-gray-700 space-y-1">
                <div>
                  <span className="font-medium">Account Name:</span> {data.bank_details.account_name}
                </div>
                <div>
                  <span className="font-medium">Bank:</span> {data.bank_details.bank}
                </div>
                <div>
                  <span className="font-medium">Account No:</span> {data.bank_details.account_no}
                </div>
                <div>
                  <span className="font-medium">IFSC:</span> {data.bank_details.ifsc}
                </div>
                {data.bank_details.upi_id && (
                  <div>
                    <span className="font-medium">UPI ID:</span> {data.bank_details.upi_id}
                  </div>
                )}
              </div>
            </div>
            {qrCodeUrl && data.outputs.show_qr && (
              <div className="text-center">
                <img src={qrCodeUrl} alt="Payment QR Code" className="w-32 h-32" />
                <p className="text-xs text-gray-600 mt-2">Scan to Pay</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
          <p className="font-semibold">For {data.company.name}</p>
          <div className="mt-16 mb-2">
            <div className="inline-block border-t border-gray-400 px-8">Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  )
}
