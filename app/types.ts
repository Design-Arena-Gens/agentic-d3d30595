export interface TaxItem {
  name: string
  rate: number
}

export interface Discount {
  type: 'percent' | 'fixed'
  value: number
}

export interface LineItem {
  description: string
  hsn_sac?: string
  quantity: number
  unit: string
  unit_price: number
  discount?: Discount
  tax: TaxItem[]
}

export interface Company {
  name: string
  tagline?: string
  address: string
  gst?: string
  email: string
  phone: string
  website?: string
  logo_url?: string
}

export interface BillTo {
  name: string
  address: string
  gst?: string
  email: string
  phone: string
}

export interface AdditionalCharge {
  label: string
  amount: number
}

export interface BankDetails {
  account_name: string
  bank: string
  account_no: string
  ifsc: string
  upi_id?: string
}

export interface Outputs {
  formats: Array<'markdown' | 'html_email' | 'pdf_ready' | 'json'>
  show_amount_in_words: boolean
  show_qr: boolean
}

export interface DocumentData {
  document_type: 'invoice' | 'quotation' | 'bill'
  doc_no: string
  doc_date: string
  due_date?: string
  valid_until?: string
  company: Company
  bill_to: BillTo
  line_items: LineItem[]
  shipping: number
  additional_charges: AdditionalCharge[]
  rounding: 'nearest' | 'up' | 'down' | 'none'
  notes?: string
  terms: string[]
  bank_details: BankDetails
  outputs: Outputs
}

export interface CalculatedLineItem extends LineItem {
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
}

export interface DocumentCalculations {
  line_items: CalculatedLineItem[]
  subtotal: number
  total_discount: number
  tax_breakdown: { [key: string]: number }
  total_tax: number
  shipping: number
  additional_charges_total: number
  subtotal_before_rounding: number
  rounding_adjustment: number
  grand_total: number
  amount_in_words: string
}
