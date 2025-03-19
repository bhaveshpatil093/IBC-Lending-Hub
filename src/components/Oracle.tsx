import React, { useState, useEffect, useCallback } from 'react';
import { useOracle } from '../src/useOracle';

const OracleComponent: React.FC = () => {
  const { queryPrice } = useOracle();
  const [ntrnAtomPrice, setNtrnAtomPrice] = useState<string | null>(null);
  const [atomNtrnPrice, setAtomNtrnPrice] = useState<string | null>(null);

  const handleQueryPrices = useCallback(async () => {
    const ntrnResponse = await queryPrice('NTRN', 'USD');
    const atomResponse = await queryPrice('ATOM', 'USD');

    if (ntrnResponse && atomResponse) {
      const ntrnUsdPriceRaw = parseFloat(ntrnResponse.price.price);
      const atomUsdPriceRaw = parseFloat(atomResponse.price.price);

      const ntrnUsdPrice = ntrnUsdPriceRaw / 10 ** 8;
      const atomUsdPrice = atomUsdPriceRaw / 10 ** 9;

      const ntrnAtomPrice = (ntrnUsdPrice / atomUsdPrice).toFixed(4);
      const atomNtrnPrice = (atomUsdPrice / ntrnUsdPrice).toFixed(4);

      setNtrnAtomPrice(ntrnAtomPrice);
      setAtomNtrnPrice(atomNtrnPrice);
    }
  }, [queryPrice]);

  useEffect(() => {
    handleQueryPrices();
    const interval = setInterval(handleQueryPrices, 10000); 
    console.log('OracleComponent mounted');
    return () => clearInterval(interval);
  }, [handleQueryPrices]);

  return (
    <div>
      {ntrnAtomPrice && <p>NTRN/ATOM Price: {ntrnAtomPrice}</p>}
      {atomNtrnPrice && <p>ATOM/NTRN Price: {atomNtrnPrice}</p>}
    </div>
  );
};

export default OracleComponent;