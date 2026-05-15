import React, { useEffect, useState } from 'react';
import { invoiceApi } from '../../api/financeApi';
import { Invoice, InvoiceStatus, InvoiceEntity } from '../../types/finance';
import { Link } from 'react-router-dom';

const InvoicesListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [filterEntity, setFilterEntity] = useState<InvoiceEntity | 'ALL'>('ALL');

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus, filterEntity]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filterStatus !== 'ALL') {
        response = await invoiceApi.getByStatus(filterStatus);
      } else if (filterEntity !== 'ALL') {
        response = await invoiceApi.getByEntity(filterEntity);
      } else {
        response = await invoiceApi.getAll();
      }
      
      setInvoices(response.data.data!.content || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: InvoiceStatus) => {
    const baseClass = 'px-2 py-1 rounded-full text-xs font-semibold';
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

  const calculateBalance = (invoice: Invoice) => {
    const total = invoice.totalAmount || 0;
    const paid = invoice.paidAmount || 0;
    return total - paid;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Link
          to="/invoices/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Invoice
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            {Object.values(InvoiceStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Entity</label>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value as InvoiceEntity | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Entities</option>
            {Object.values(InvoiceEntity).map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.entity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadgeClass(invoice.status)}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(invoice.paidAmount, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(calculateBalance(invoice), invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View
                    </Link>
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesListPage;
