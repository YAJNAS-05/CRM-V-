import React from 'react';
import CoaTree from '../../components/finance/CoaTree';
import CoaList from '../../components/finance/CoaList';
import CoaForm from '../../components/finance/CoaForm';

const CoaPage: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Chart of Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <CoaTree />
        </div>
        <div className="md:col-span-2 space-y-6">
          <CoaForm />
          <CoaList />
        </div>
      </div>
    </div>
  );
};

export default CoaPage;
