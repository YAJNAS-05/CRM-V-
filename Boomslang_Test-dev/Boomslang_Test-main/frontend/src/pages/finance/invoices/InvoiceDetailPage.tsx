import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoiceApi, paymentApi } from '../../api/financeApi';
import { Invoice, Payment, InvoiceStatus } from '../../types/finance';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const [invoiceResponse, paymentsResponse] = await Promise.all([
        invoiceApi.getById(id!),
        paymentApi.getByInvoice(id!)
      ]);
      setInvoice(invoiceResponse.data.data);
      setPayments(paymentsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: InvoiceStatus) => {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold';
    switch (status) {
      case InvoiceStatus.PAID:
        return `${baseClass} bg-green-100 text-green-800`;
      case InvoiceStatus.PARTIALLY_PAID:
        return `${baseClass} bg-blue-100 text-blue-800`;
      case InvoiceStatus.OVERDUE:
        return `${baseClass} bg-red-100 text-red-800`;
      case InvoiceStatus.SENT:
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case InvoiceStatus.DRAFT:
        return `${baseClass} bg-gray-100 text-gray-800`;
      case InvoiceStatus.CANCELLED:
        return `${baseClass} bg-gray-300 text-gray-600`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return '-';
    return `${currency || 'AUD'} ${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-AU');
  };

  const calculateBalance = () => {
    if (!invoice) return 0;
    const total = invoice.totalAmount || 0;
    const paid = invoice.paidAmount || 0;
    return total - paid;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading invoice details...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/invoices" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Invoices
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <span className={getStatusBadgeClass(invoice.status)}>
              {invoice.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            {invoice.pdfUrl && (
              <a
                href={invoice.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download PDF
              </a>
            )}
            <Link
              to={`/payments/new?invoiceId=${invoice.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Record Payment
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Entity:</span>
              <span className="font-medium">{invoice.entity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{invoice.type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Issue Date:</span>
              <span className="font-medium">{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Currency:</span>
              <span className="font-medium">{invoice.currency || 'AUD'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Amount:</span>
              <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-semibold">Total Amount:</span>
              <span className="font-bold text-lg">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid Amount:</span>
              <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-semibold">Balance Due:</span>
              <span className="font-bold text-lg text-red-600">{formatCurrency(calculateBalance(), invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payments recorded yet</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.method?.replace('_', ' ') || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.reference || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
