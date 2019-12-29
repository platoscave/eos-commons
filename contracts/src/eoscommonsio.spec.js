var expect = require('chai').expect;

describe('Global eos', () => {
  it('is an object', () => {
    expect(eos).to.be.an('object');
  });

  it(`can get chain info and chainId is ${process.env.EOSIO_CHAIN_ID}`, async () => {
    const chainInfo = await eos.getInfo({});
    expect(chainInfo).to.be.an('object');
    expect(chainInfo.chain_id).to.equal(process.env.EOSIO_CHAIN_ID);
  });

  it('can get account "eosio"', async () => {
    const eosioAccount = await eos.getAccount('eosio');
    expect(eosioAccount.account_name).to.equal('eosio');
  });
});