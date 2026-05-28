import { useQuery } from '@tanstack/react-query';
import { fetchVendorOwners } from '@/services/vendorOwnerService';
import { useState } from 'react';

export const useVendorOwnerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const query = useQuery({
    queryKey: ['vendorOwners', searchTerm],
    queryFn: () => fetchVendorOwners({ search: searchTerm }),
    enabled: true,
  });

  return {
    searchTerm,
    setSearchTerm,
    owners: query.data?.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};
