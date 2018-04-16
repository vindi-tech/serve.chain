var Cryptr = require('cryptr')
var moment = require('moment')
var express =  require('express')
var app = new express()
var bodyParser = require('body-parser')
var request = require('request')
const publicIp = require('public-ip');
const bytesize = require('bytesize');

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(urlencodedParser)

var txOuts = [{from:'gen', address:'jordan', value:100000}]

var value = 100000

var peers = ['localhost:3000', 'localhost:3002']

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
  var cryptr = new Cryptr(block.index.toString())
  var encrypt = cryptr.encrypt(block.timestamp)
  return encrypt
}

var getGenesisBlock = () => {
    var data ={txOut: { value: 100000, address: 'jordan' },}

    return new Block(0, "0", 1465154705, data, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

var blockchain = [getGenesisBlock()];
// var blockchain1 = [getGenesisBlock()];

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
// blockchain1.push(generateNextBlock('h'))

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
// replaceChain(blockchain1, blockchain)

var getAllTx = (blockchain) => {
  var txOutsAll = []
  for (var i = 0; i < blockchain.length; i++) {
    var transaction = blockchain[i].data
    txOutsAll.push(transaction)
    console.log('transaction',transaction);
  }
  return txOutsAll
}

var findUnspentTx = (txOuts) => {

  var uSTXO = []
  for (var i = 0; i < txOuts.length; i++) {
    if (txOuts[i].txOut.address=== 'jordan') {
      uSTXO.push(txOuts[i])
    }

  }
  console.log('ust');
  return uSTXO
}

var createTxOut = (receiver, myAddress, amount, send) => {
  var leftOver = amount - send

  const txOut1 = {value:send, address: receiver}

  if (leftOver === 0) {
    return [txOut1]
  }
  else {
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
    txSpent: txOuts[0],
    blockIndex: blockchain.length
  }

  if (tx.length > 1) {
    var ider = new Cryptr(transaction.time.toString())
    transaction.id = ider.encrypt(transaction.blockIndex)

    console.log('transaction');
    console.timeEnd('createTransaction')
    transaction.value = transaction.txOut.value
    return transaction
  }
  else {

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
  return blockchain
}

var syncChain = (peer) => { // performs a post request to your peers address
  var options = { method: 'GET',
  url: `http://localhost:${peer}/blocks`,
  headers:{ 'Postman-Token': 'd6b43245-53a3-063a-7b94-85aff6374e69',
     'Cache-Control': 'no-cache' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    return body
    console.log('body', body);
  });

}

var send = (peer, to, amount) => { // performs a post request to your peers address
  var options = { method: 'POST',
  url: `http://localhost:${peer}/blocks/${to}/${amount}`,
  headers:{ 'Postman-Token': 'd6b43245-53a3-063a-7b94-85aff6374e69',
     'Cache-Control': 'no-cache' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    return body.toString()
    console.log('body', body);
  });

}

app.get('/blocks', (req, res) => {
  res.send(JSON.stringify(blockchain))
})

app.post('/blocks/:to/:amount', urlencodedParser, (req, res) => {
  var chain = [getGenesisBlock()]
  var tx = createTxOut(req.params.to, 'jordan', `${value}`,req.params.amount)
    value=`${value}` - req.params.amount
  var newBlock = createBlockWithTransaction(createTransaction('0x00', tx))
  if (isValidNewBlock(newBlock, getLatestBlock()) ===true) {
    blockchain.push(newBlock)
    console.log(blockchain);
    res.send(blockchain)
  }

})

app.get('/send/:to/:amount',(req, res) => {
  send(3000,  req.params.to, req.params.amount)
  send(3002,  req.params.to, req.params.amount)
  res.send(blockchain)
})

app.get('/tx/:to/:amount', (req, res) => {


    console.log('ready to create block');
    var tx = createTxOut(req.params.to, 'jordan', `${value}`, req.params.amount)
    console.log('new TxOut created', tx);
    var newTrans = createBlockWithTransaction(createTransaction('0x00', tx))

    console.log(generateNextBlock(newTrans.data));
    blockchain.push(newTrans)
    res.send(newTrans)
    console.log('findUnspentTx(txOuts)',findUnspentTx(getAllTx(blockchain)) );


})
const size = bytesize.stringSize(blockchain.toString());
console.log(size);
app.listen(3000, () => {

  console.log('\n     Your ip address');

  publicIp.v4().then(ip => {
      console.log('ipv4 : ',ip);
      //=> '46.5.21.123'
  });

  publicIp.v6().then(ip => {
      console.log('ipv6 :',ip);
      //=> 'fe80::200:f8ff:fe21:67cf'
  });

})
