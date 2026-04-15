import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { quoteApi, dealApi } from '../../api/crmApi'
import { Quote, Deal, CreateQuoteLineItemRequest } from '../../types/crm'
import { toast } from 'sonner'

const quoteLineItemSchema = z.object({
  equipmentId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price required'),
  discountPct: z.number().optional(),
  totalPrice: z.number().min(0, 'Total price required'),
})

const quoteSchema = z.object({
  dealId: z.string().min(1, 'Deal is required'),
  quoteNumber: z.string().min(1, 'Quote number is required'),
  version: z.number().default(1),
  status: z.string().default('DRAFT'),
  issuedDate: z.string().min(1, 'Issued date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  currency: z.string().default('USD'),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  pdfUrl: z.string().optional(),
  lineItems: z.array(quoteLineItemSchema),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteDetailPageProps {
  isNew?: boolean
}

const QuoteDetailPage: React.FC<QuoteDetailPageProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(!isNew)
  const [deals, setDeals] = useState<Deal[]>([])
  
  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      status: 'DRAFT',
      currency: 'USD',
      version: 1,
      lineItems: [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  })

  const formValues = watch()

  useEffect(() => {
    fetchDeals()
    if (!isNew && id) {
      fetchQuote()
    } else {
      setIsFetching(false)
    }
  }, [id, isNew])

  const fetchDeals = async () => {
    try {
      const response = await dealApi.getAll(0, 100)
      setDeals(response.data.data?.content || [])
    } catch (error) {
      toast.error('Failed to load deals')
    }
  }

  const fetchQuote = async () => {
    try {
      const response = await quoteApi.getById(id!)
      const quote = response.data.data
      if (!quote) {
        toast.error('Quote not found')
        navigate('/quotes')
        return
      }
      reset({
        dealId: quote.dealId,
        quoteNumber: quote.quoteNumber,
        version: quote.version,
        status: quote.status,
        issuedDate: quote.issuedDate,
        expiryDate: quote.expiryDate,
        currency: quote.currency,
        subtotal: quote.subtotal,
        taxAmount: quote.taxAmount,
        totalAmount: quote.totalAmount,
        notes: quote.notes,
        terms: quote.terms,
        pdfUrl: quote.pdfUrl,
        lineItems: quote.lineItems.map(item => ({
          equipmentId: item.equipmentId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPct: item.discountPct,
          totalPrice: item.lineTotal,
        })),
      })
    } catch (error) {
      toast.error('Failed to load quote')
      navigate('/crm/quotes')
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data: QuoteFormData) => {
    setIsLoading(true)
    try {
      if (isNew) {
        await quoteApi.create(data)
        toast.success('Quote created successfully')
      } else {
        await quoteApi.update(id!, data)
        toast.success('Quote updated successfully')
      }
      navigate('/crm/quotes')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">{isNew ? 'New Quote' : 'Edit Quote'}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Quote Header Info */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Quote Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal *
                </label>
                <select
                  {...register('dealId')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Deal</option>
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>{deal.name}</option>
                  ))}
                </select>
                {errors.dealId && <p className="text-red-500 text-sm mt-1">{errors.dealId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Number *
                </label>
                <input
                  type="text"
                  {...register('quoteNumber')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.quoteNumber && <p className="text-red-500 text-sm mt-1">{errors.quoteNumber.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  {...register('currency')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issued Date *
                </label>
                <input
                  type="date"
                  {...register('issuedDate')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.issuedDate && <p className="text-red-500 text-sm mt-1">{errors.issuedDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  {...register('expiryDate')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Line Items</h2>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 })}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm"
              >
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Discount %</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          {...register(`lineItems.${index}.description`)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 border rounded text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 border rounded text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          {...register(`lineItems.${index}.discountPct`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 border rounded text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          {...register(`lineItems.${index}.totalPrice`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 border rounded text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtotal
              </label>
              <input
                type="number"
                {...register('subtotal', { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Amount
              </label>
              <input
                type="number"
                {...register('taxAmount', { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <input
                type="number"
                {...register('totalAmount', { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms
              </label>
              <textarea
                {...register('terms')}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/crm/quotes')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuoteDetailPage
