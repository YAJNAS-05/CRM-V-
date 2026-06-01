import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coaApi } from '../../api/financeApi';

const initialForm = {
  code: '',
  name: '',
  accountType: '',
  normalBalance: '',
  parentId: undefined as number | undefined,
};

const CoaForm: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (account: typeof initialForm) => coaApi.create(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coa-list'] });
      queryClient.invalidateQueries({ queryKey: ['coa-tree'] });
      setForm(initialForm);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white">
      <div>
        <label className="block font-medium">Code</label>
        <input name="code" value={form.code} onChange={handleChange} className="input input-bordered w-full" required />
      </div>
      <div>
        <label className="block font-medium">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full" required />
      </div>
      <div>
        <label className="block font-medium">Account Type</label>
        <select name="accountType" value={form.accountType} onChange={handleChange} className="input input-bordered w-full" required>
          <option value="">Select</option>
          <option value="ASSET">Asset</option>
          <option value="LIABILITY">Liability</option>
          <option value="EQUITY">Equity</option>
          <option value="REVENUE">Revenue</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>
      <div>
        <label className="block font-medium">Normal Balance</label>
        <select name="normalBalance" value={form.normalBalance} onChange={handleChange} className="input input-bordered w-full" required>
          <option value="">Select</option>
          <option value="DEBIT">Debit</option>
          <option value="CREDIT">Credit</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Add Account'}
      </button>
      {mutation.isError && <div className="text-red-500">Error: {(mutation.error as any)?.message}</div>}
    </form>
  );
};

export default CoaForm;
