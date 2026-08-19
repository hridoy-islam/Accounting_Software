import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { currencies } from '@/types';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  loading: boolean;
}

const DEFAULT_CURRENCY: CurrencyInfo = {
  code: 'GBP',
  symbol: '£',
  loading: true
};

export function useCurrency(): CurrencyInfo {
  const { id } = useParams<{ id: string }>();
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);

  useEffect(() => {
    let mounted = true;
    if (!id) return;

    axiosInstance
      .get(`/users/${id}`)
      .then((res) => {
        if (!mounted) return;
        const code = (res?.data?.data?.currency || 'GBP').toUpperCase();
        const found = currencies.find((c) => c.code === code);
        setCurrency({
          code,
          symbol: found?.symbol || '£',
          loading: false
        });
      })
      .catch(() => {
        if (mounted) {
          setCurrency((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return currency;
}
