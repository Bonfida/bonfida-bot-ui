const getCoinIcon = (symbol: string | undefined) => {
  switch (symbol) {
    case 'BTC':
      return require('../assets/icons/crypto/btc.png').default;
    case 'ETH':
      return require('../assets/icons/crypto/eth.png').default;
    case 'LINK':
      return require('../assets/icons/crypto/link.png').default;
    case 'ETC':
      return require('../assets/icons/crypto/etc.png').default;
    case 'EOS':
      return require('../assets/icons/crypto/eos.png').default;
    case 'LTC':
      return require('../assets/icons/crypto/ltc.png').default;
    case 'BCH':
      return require('../assets/icons/crypto/bch.png').default;
    case 'BNB':
      return require('../assets/icons/crypto/bnb.png').default;
    case 'BSV':
      return require('../assets/icons/crypto/bsv.png').default;
    case 'XTZ':
      return require('../assets/icons/crypto/xtz.png').default;
    case 'XRP':
      return require('../assets/icons/crypto/xrp.png').default;
    case 'ALGO':
      return require('../assets/icons/crypto/algo.png').default;
    case 'MATIC':
      return require('../assets/icons/crypto/matic.png').default;
    case 'OKB':
      return require('../assets/icons/crypto/okb.png').default;
    case 'HT':
      return require('../assets/icons/crypto/ht.png').default;
    case 'ATOM':
      return require('../assets/icons/crypto/atom.png').default;
    case 'TRX':
      return require('../assets/icons/crypto/trx.png').default;
    case 'PAXG':
      return require('../assets/icons/crypto/pax.png').default;
    case 'ADA':
      return require('../assets/icons/crypto/ada.png').default;
    case 'USDT':
      return require('../assets/icons/crypto/usdt.png').default;
    case 'DRGN':
      return require('../assets/icons/crypto/drgn.png').default;
    case 'DOGE':
      return require('../assets/icons/crypto/doge.png').default;
    case 'TOMO':
      return require('../assets/icons/crypto/tomo.png').default;
    case 'BTMX':
      return require('../assets/icons/crypto/btmx.png').default;
    case 'TRYB':
      return require('../assets/icons/crypto/tryb.png').default;
    case 'LEO':
      return require('../assets/icons/crypto/leo.png').default;
    case 'FTT':
      return require('../assets/icons/crypto/ftt.png').default;
    case 'FTT_R3':
      return require('../assets/icons/crypto/ftt.png').default;
    case 'FTT_TT1':
      return require('../assets/icons/crypto/ftt.png').default;
    case 'FTT_TT2':
      return require('../assets/icons/crypto/ftt.png').default;
    case 'USD':
      return require('../assets/icons/crypto/usd.png').default;
    case 'EUR':
      return require('../assets/icons/crypto/eur.png').default;
    case 'BRZ':
      return require('../assets/icons/crypto/brz.png').default;
    case 'BRL':
      return require('../assets/icons/crypto/brl.png').default;
    case 'KNC':
      return require('../assets/icons/crypto/knc.png').default;
    case 'WRX':
      return require('../assets/icons/crypto/wrx.png').default;
    case 'THETA':
      return require('../assets/icons/crypto/theta.png').default;
    case 'XAUT':
      return require('../assets/icons/crypto/xaut.png').default;
    case 'COMP':
      return require('../assets/icons/crypto/comp.svg').default;
    case 'BAL':
      return require('../assets/icons/crypto/bal.svg').default;
    case 'TRUMPWIN':
      return require('../assets/icons/crypto/trumpwin.png').default;
    case 'TRUMPLOSE':
      return require('../assets/icons/crypto/trumplose.png').default;
    case 'SRM':
      return require('../assets/icons/crypto/srm.svg').default;
    case 'MSRM':
      return require('../assets/icons/crypto/msrm.svg').default;
    case 'SRM_LOCKED':
      return require('../assets/icons/crypto/srm.svg').default;
    case 'MSRM_LOCKED':
      return require('../assets/icons/crypto/msrm.svg').default;
    case 'SXP':
      return require('../assets/icons/crypto/sxp.png').default;
    case 'SOL':
      return require('../assets/icons/crypto/sol.png').default;
    case 'YFI':
      return require('../assets/icons/crypto/yfi.svg').default;
    case 'RUNE':
      return require('../assets/icons/crypto/rune.png').default;
    case 'AMPL':
      return require('../assets/icons/crypto/ampl.png').default;
    case 'WBTC':
      return require('../assets/icons/crypto/wbtc.png').default;
    case 'MKR':
      return require('../assets/icons/crypto/mkr.png').default;
    case 'DMG':
      return require('../assets/icons/crypto/dmm.png').default;
    case 'UBXT':
      return require('../assets/icons/crypto/ubxt.png').default;
    case 'UNI':
      return require('../assets/icons/crypto/uni.png').default;
    case 'LEND':
      return require('../assets/icons/crypto/aave.png').default;
    case 'CREAM':
      return require('../assets/icons/crypto/cream.png').default;
    case 'HGET':
      return require('../assets/icons/crypto/hdget.png').default;
    case 'HNT':
      return require('../assets/icons/crypto/hnt.png').default;
    case 'MTA':
      return require('../assets/icons/crypto/mstable.png').default;
    case 'SUSHI':
      return require('../assets/icons/crypto/sushi.png').default;
    case 'FRONT':
      return require('../assets/icons/crypto/front.png').default;
    case 'ALEPH':
      return require('../assets/icons/crypto/aleph.png').default;
    case 'OMG':
      return require('../assets/icons/crypto/omg.png').default;
    case 'FIDA':
      return require('../assets/icons/crypto/fida.svg').default;
    case 'USDC':
      return require('../assets/icons/crypto/usdc.png').default;
    default:
      return require('../assets/icons/crypto/other.png').default;
  }
};

export default getCoinIcon;
