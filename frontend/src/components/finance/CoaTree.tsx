import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { coaApi } from '../../api/financeApi';

interface CoaNode {
  id: number;
  code: string;
  name: string;
  children?: CoaNode[];
}

const CoaTree: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['coa-tree'],
    queryFn: coaApi.fetchTree,
    initialData: undefined,
  });

  if (isLoading) return <div>Loading tree...</div>;
  if (error) return <div>Error loading tree</div>;
  if (!data) return <div>No data</div>;

  // Recursive tree rendering
  const renderTree = (node: CoaNode) => (
    <li key={node.id}>
      <span className="font-semibold">{node.code} - {node.name}</span>
      {node.children && node.children.length > 0 && (
        <ul className="ml-4 border-l border-gray-300 pl-2">
          {node.children.map(renderTree)}
        </ul>
      )}
    </li>
  );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">COA Tree</h2>
      <ul>{renderTree(data)}</ul>
    </div>
  );
};

export default CoaTree;
