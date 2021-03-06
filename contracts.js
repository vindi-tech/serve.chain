var Cryptr = require('cryptr')
var moment = require('moment')
var express =  require('express')
var app = new express()
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser)
var txOuts = [{value:10000, address: 'jordan', id:'0x0000000'}]
var value = 100000
class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash
    }
}

var calculateHash = (block) => {
  var cryptr = new Cryptr(block.timestamp)
  var encrypt = cryptr.encrypt(block.data)
  return encrypt
}
var genData ={ id: '60e6ffe6ba02ca119c3cb87800759059',
     time: 'Apr 13, 2018 11:02:15 PM',
     txInOut: [ [Object], [Object] ],
     txOut: { value: 1000, address: 'chase' },
     leftOver: { value: 99000, address: 'jordan' },
     blockIndex: 2,
     value: 1000 };
var getGenesisBlock = () => {
    return new Block(1, "0", "1465154705", genData, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

var blockchain = [getGenesisBlock()];
var blockchain1 = [getGenesisBlock()];

var getLatestBlock = () => {
  return blockchain[blockchain.length - 1]
}

var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var day = moment().format('ll')
    var hour = moment().format('LTS')
    var nextTimestamp = day;

    var block = new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData)
    var nextHash = calculateHash(block);
    block.hash = nextHash
    return block
};
blockchain1.push(generateNextBlock('h'))

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (calculateHash(newBlock) !== newBlock.hash) {
        console.log('invalid hash: ' + calculateHash(newBlock) + ' ' + newBlock.hash);
        return false;
    }
    return true;
};
// console.log('isValidNewBlock', isValidNewBlock(generateNextBlock('j'), getLatestBlock()));
var checkForNewBlocks = (chain, newChain) => {
  var diff = newChain.length - chain.length
  var newBlocks = []
  if (diff > 0) {
    for (var i = diff; i < newChain.length; i++) {
      var newBlock = newChain[chain.length - 1 + i]
      newBlocks.push(newBlock)
      console.log('new blocks', diff);
      return newBlocks
    }
  } else {
    return 'no new'
  }
}
var isValidChain = (chain, blockchain) => {
  // checkForNewBlocks(chain, blockchain)
  for (var i = chain.length - 1; i < chain.length; i++) {
    if (isValidNewBlock(chain[i], chain[i - 1])) {

      console.log('valid chain');
      return true
    } else {
      return false
    }
  }
}

var replaceChain = (newBlocks, blockchain) => {
    var news = checkForNewBlocks(blockchain, newBlocks)
    if (isValidChain(newBlocks, blockchain) == true && newBlocks != 'no new') {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        // broadcast(responseLatestMsg());
        for (var i = blockchain.length; i < newBlocks.length; i++) {
          blockchain.push(newBlocks[i])
          console.log('\nnewBlock', news, '\n\n');
          console.log('blockchain', blockchain, '\n\n', `size: ${blockchain.length}`);
        }
    } else {
        console.log('Received blockchain invalid');
    }
};
replaceChain(blockchain1, blockchain)

var findUnspentTx = (txOuts) => {
  var uSTXO = []
  for (var i = 0; i < txOuts.length; i++) {
    if (txOuts[i].address === 'jordan') {
      uSTXO.push(txOuts[i])
    }

  }
  console.log('ust');
  return uSTXO
}
console.log('findUnspentTx(txOuts)',findUnspentTx(txOuts) );
var createTxOut = (receiver, myAddress, amount, send) => {
  var leftOver = amount - send
  const txOut1 = {value:send, address: receiver}
  if (leftOver === 0) {
    return [txOut1]
  } else {
    const txOut2 =  {value:leftOver, address: myAddress}
    return [txOut1, txOut2]
  }
}

var createTransaction = (privateKey, tx) => {
  txOuts.push(tx[1])
  console.time('createTransaction')
  var cryptr = new Cryptr(privateKey);
  var transaction = {
    id: '',
    time:moment().format('ll') + ' ' + moment().format('LTS'),
    txInOut: [tx[0], tx[1]],
    txOut:tx[0],
    leftOver:tx[1],
    blockIndex: blockchain.length
  }

  if (tx.length > 1) {
    var ider = new Cryptr(transaction.time.toString())
    transaction.id = ider.encrypt(transaction.blockIndex)

    console.log('transaction');
    console.timeEnd('createTransaction')
    transaction.value = transaction.txOut.value
    return transaction
  } else {
    var ider = new Cryptr(transaction.time)

    var encrypt = cryptr.encrypt(transaction.toString())
    transaction.id = ider.encrypt(transaction)

    return transaction

  }
}
// console.log(createTransaction('0x0000000', createTxOut('a', 'b', 10, 2)));

var createBlockWithTransaction = (blockData) => {
  var block = generateNextBlock(blockData)
  return block
}

console.log(createBlockWithTransaction(createTransaction('0xxx000000000ncncn', createTxOut('chase', 'jordan', 100000, 1000))));

var checkWaitTime = (lastBlock) => {
  var time = lastBlock.timestamp
  var currentTime = moment().format('ll') + moment().format('LTS')
  var cur = moment().seconds(currentTime)
console.log();
  var diff = moment(currentTime).from(time)
  console.log(diff);
  if (diff >='a few seconds ago') {
    console.log('itdoes');
    console.log(currentTime)
    return true
  } else {
    return false
  }

}

var generation = () => {
  var newT = []

  for (var i = 0; i < 100; i++) {
    var newTrans = createBlockWithTransaction(createTransaction('0x00', createTxOut('jordan', 'gen', 100, 1)))
    blockchain.push(newTrans)

  }
  return blockchain.length
}

var hashOfChain = (chain, chainId) => {

  var hash =''
  for (var i = 0; i < chain.length; i++) {
    var hasher = new Cryptr(chain[i].index.toString())

    hash += hasher.encrypt(chain[i].data, chain[i].timestamp)
  }
  return hasher.encrypt(hash)
}
console.log(hashOfChain(blockchain, '0x000000001'));

app.listen(3000)
