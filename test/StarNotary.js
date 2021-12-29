const StarNotary = artifacts.require('./StarNotary.sol');

var accounts;

contract('StarNotary', async (accs) => {
  accounts = accs;
});

describe('StarNotary', () => {
  it('can create a Star', async () => {
    const instance = await StarNotary.deployed();
    const tokenId = 1;

    await instance.createStar('Sirius', tokenId, { from: accounts[0] });

    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Sirius');
  });

  it('owner can put a Star for sale', async () => {
    const instance = await StarNotary.deployed();
    const owner = accounts[1];
    const starId = 2;
    const starPrice = web3.utils.toWei('0.01', 'ether');

    await instance.createStar('Betelgeuse', starId, { from: owner });
    await instance.putStarForSale(starId, starPrice, { from: owner });

    assert.equal(await instance.starsForSale.call(starId), starPrice);
  });

  it('owner get the funds after the sale', async () => {
    const instance = await StarNotary.deployed();
    const owner = accounts[1];
    const buyer = accounts[2];
    const starId = 3;
    const starPrice = web3.utils.toWei('0.01', 'ether');
    const balance = web3.utils.toWei('0.05', 'ether');

    await instance.createStar('Rigel', starId, { from: owner });
    await instance.putStarForSale(starId, starPrice, { from: owner });
    await instance.approve(buyer, starId, { from: owner });

    const ownerBalance = await web3.eth.getBalance(owner);
    await instance.buyStar(starId, { from: buyer, value: balance });
    const ownerBalanceAfter = await web3.eth.getBalance(owner);

    const value1 = Number(ownerBalance) + Number(starPrice);
    const value2 = Number(ownerBalanceAfter);

    assert.equal(value1, value2);
  });

  it('buyer can buy a Star for sale', async () => {
    const instance = await StarNotary.deployed();
    const owner = accounts[1];
    const buyer = accounts[2];
    const starId = 4;
    const starPrice = web3.utils.toWei('0.01', 'ether');
    const balance = web3.utils.toWei("0.05", "ether");

    await instance.createStar('Vega', starId, { from: owner });
    await instance.putStarForSale(starId, starPrice, { from: owner });
    await instance.approve(buyer, starId, { from: owner });
    await instance.buyStar(starId, { from: buyer, value: balance });

    assert.equal(await instance.ownerOf.call(starId), buyer);
  });

  it('buyer balance decreases after buying a Star', async () => {
    const instance = await StarNotary.deployed();
    const owner = accounts[1];
    const buyer = accounts[2];
    const starId = 5;
    const starPrice = web3.utils.toWei('0.01', 'ether');
    const balance = web3.utils.toWei('0.05', 'ether');

    await instance.createStar('Alpha Centauri', starId, { from: owner });
    await instance.putStarForSale(starId, starPrice, { from: owner });
    await instance.approve(buyer, starId, { from: owner });

    const buyerBalance = await web3.eth.getBalance(buyer);
    await instance.buyStar(starId, {
      from: buyer,
      value: balance,
      gasPrice: 0,
    });
    const buyerBalanceAfter = await web3.eth.getBalance(buyer);
    const value = Number(buyerBalance) - Number(buyerBalanceAfter);

    assert.equal(value, starPrice);
  });
});
