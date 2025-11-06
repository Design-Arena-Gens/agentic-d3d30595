'use client'

import { useState } from 'react'
import { DocumentData, LineItem, TaxItem, AdditionalCharge } from '../types'

interface Props {
  onGenerate: (data: DocumentData) => void
}

export default function DocumentForm({ onGenerate }: Props) {
  const [docType, setDocType] = useState<'invoice' | 'quotation' | 'bill'>('invoice')
  const [docNo, setDocNo] = useState('DA-INV-2025-001')
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [validUntil, setValidUntil] = useState('')

  // Company details
  const [companyName, setCompanyName] = useState('Design Arena')
  const [companyTagline, setCompanyTagline] = useState('Creative Designs That Inspire')
  const [companyAddress, setCompanyAddress] = useState('123 Design Street, Creative City, State, 400001')
  const [companyGST, setCompanyGST] = useState('22AAAAA0000A1Z5')
  const [companyEmail, setCompanyEmail] = useState('hello@designarena.com')
  const [companyPhone, setCompanyPhone] = useState('+91-9876543210')
  const [companyWebsite, setCompanyWebsite] = useState('https://designarena.com')

  // Client details
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientGST, setClientGST] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      description: '',
      hsn_sac: '9983',
      quantity: 1,
      unit: 'project',
      unit_price: 0,
      tax: [
        { name: 'CGST', rate: 9 },
        { name: 'SGST', rate: 9 }
      ]
    }
  ])

  const [shipping, setShipping] = useState(0)
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([])
  const [rounding, setRounding] = useState<'nearest' | 'up' | 'down' | 'none'>('nearest')
  const [notes, setNotes] = useState('Thank you for choosing Design Arena!')
  const [terms, setTerms] = useState<string[]>([
    '50% advance required to start project',
    'Balance due on project completion',
    'Digital files delivered after final payment'
  ])

  // Bank details
  const [bankAccountName, setBankAccountName] = useState('Design Arena')
  const [bankName, setBankName] = useState('HDFC Bank')
  const [bankAccountNo, setBankAccountNo] = useState('XXXXXXXXXX')
  const [bankIFSC, setBankIFSC] = useState('HDFC0000000')
  const [bankUPI, setBankUPI] = useState('designarena@upi')

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        hsn_sac: '9983',
        quantity: 1,
        unit: 'project',
        unit_price: 0,
        tax: [
          { name: 'CGST', rate: 9 },
          { name: 'SGST', rate: 9 }
        ]
      }
    ])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setLineItems(newItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data: DocumentData = {
      document_type: docType,
      doc_no: docNo,
      doc_date: docDate,
      due_date: docType !== 'quotation' ? dueDate : undefined,
      valid_until: docType === 'quotation' ? validUntil : undefined,
      company: {
        name: companyName,
        tagline: companyTagline,
        address: companyAddress,
        gst: companyGST,
        email: companyEmail,
        phone: companyPhone,
        website: companyWebsite
      },
      bill_to: {
        name: clientName,
        address: clientAddress,
        gst: clientGST,
        email: clientEmail,
        phone: clientPhone
      },
      line_items: lineItems,
      shipping,
      additional_charges: additionalCharges,
      rounding,
      notes,
      terms,
      bank_details: {
        account_name: bankAccountName,
        bank: bankName,
        account_no: bankAccountNo,
        ifsc: bankIFSC,
        upi_id: bankUPI
      },
      outputs: {
        formats: ['markdown', 'html_email', 'pdf_ready', 'json'],
        show_amount_in_words: true,
        show_qr: true
      }
    }

    onGenerate(data)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Document Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="invoice">Invoice</option>
            <option value="quotation">Quotation</option>
            <option value="bill">Bill</option>
          </select>
        </div>

        {/* Document Number & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Number
            </label>
            <input
              type="text"
              value={docNo}
              onChange={(e) => setDocNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Date
            </label>
            <input
              type="date"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Due Date / Valid Until */}
        {docType !== 'quotation' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {docType === 'quotation' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Client Details */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Client Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Address
              </label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Phone
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client GST (Optional)
              </label>
              <input
                type="text"
                value={clientGST}
                onChange={(e) => setClientGST(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Line Items</h3>
          {lineItems.map((item, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN/SAC
                    </label>
                    <input
                      type="text"
                      value={item.hsn_sac}
                      onChange={(e) => updateLineItem(index, 'hsn_sac', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price (₹)
                    </label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Item
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addLineItem}
            className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + Add Line Item
          </button>
        </div>

        {/* Additional Options */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Additional Options</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping (₹)
                </label>
                <input
                  type="number"
                  value={shipping}
                  onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rounding
                </label>
                <select
                  value={rounding}
                  onChange={(e) => setRounding(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nearest">Nearest</option>
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-semibold"
        >
          Generate Document
        </button>
      </form>
    </div>
  )
}
