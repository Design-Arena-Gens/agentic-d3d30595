import { DocumentData, CalculatedLineItem, DocumentCalculations } from '../types'

export function calculateDocument(data: DocumentData): DocumentCalculations {
  const line_items: CalculatedLineItem[] = data.line_items.map(item => {
    const subtotal = item.quantity * item.unit_price

    let discount_amount = 0
    if (item.discount) {
      if (item.discount.type === 'percent') {
        discount_amount = (subtotal * item.discount.value) / 100
      } else {
        discount_amount = item.discount.value
      }
    }

    const subtotal_after_discount = subtotal - discount_amount

    const tax_amount = item.tax.reduce((sum, tax) => {
      return sum + (subtotal_after_discount * tax.rate) / 100
    }, 0)

    const total = subtotal_after_discount + tax_amount

    return {
      ...item,
      subtotal,
      discount_amount,
      tax_amount,
      total
    }
  })

  const subtotal = line_items.reduce((sum, item) => sum + item.subtotal, 0)
  const total_discount = line_items.reduce((sum, item) => sum + item.discount_amount, 0)

  // Calculate tax breakdown
  const tax_breakdown: { [key: string]: number } = {}
  line_items.forEach(item => {
    const subtotal_after_discount = item.subtotal - item.discount_amount
    item.tax.forEach(tax => {
      const tax_amount = (subtotal_after_discount * tax.rate) / 100
      if (tax_breakdown[tax.name]) {
        tax_breakdown[tax.name] += tax_amount
      } else {
        tax_breakdown[tax.name] = tax_amount
      }
    })
  })

  const total_tax = Object.values(tax_breakdown).reduce((sum, amount) => sum + amount, 0)

  const additional_charges_total = data.additional_charges.reduce((sum, charge) => sum + charge.amount, 0)

  const subtotal_before_rounding = subtotal - total_discount + total_tax + data.shipping + additional_charges_total

  let grand_total = subtotal_before_rounding
  let rounding_adjustment = 0

  if (data.rounding === 'nearest') {
    grand_total = Math.round(subtotal_before_rounding)
    rounding_adjustment = grand_total - subtotal_before_rounding
  } else if (data.rounding === 'up') {
    grand_total = Math.ceil(subtotal_before_rounding)
    rounding_adjustment = grand_total - subtotal_before_rounding
  } else if (data.rounding === 'down') {
    grand_total = Math.floor(subtotal_before_rounding)
    rounding_adjustment = grand_total - subtotal_before_rounding
  }

  return {
    line_items,
    subtotal,
    total_discount,
    tax_breakdown,
    total_tax,
    shipping: data.shipping,
    additional_charges_total,
    subtotal_before_rounding,
    rounding_adjustment,
    grand_total,
    amount_in_words: numberToWords(grand_total)
  }
}

function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

  if (num === 0) return 'Zero Rupees Only'

  const crore = Math.floor(num / 10000000)
  num %= 10000000
  const lakh = Math.floor(num / 100000)
  num %= 100000
  const thousand = Math.floor(num / 1000)
  num %= 1000
  const hundred = Math.floor(num / 100)
  num %= 100

  let words = ''

  if (crore > 0) {
    words += convertTwoDigit(crore) + ' Crore '
  }

  if (lakh > 0) {
    words += convertTwoDigit(lakh) + ' Lakh '
  }

  if (thousand > 0) {
    words += convertTwoDigit(thousand) + ' Thousand '
  }

  if (hundred > 0) {
    words += ones[hundred] + ' Hundred '
  }

  if (num > 0) {
    if (num < 10) {
      words += ones[num]
    } else if (num < 20) {
      words += teens[num - 10]
    } else {
      words += tens[Math.floor(num / 10)]
      if (num % 10 > 0) {
        words += ' ' + ones[num % 10]
      }
    }
  }

  return words.trim() + ' Rupees Only'

  function convertTwoDigit(n: number): string {
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + ones[n % 10] : '')
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}
