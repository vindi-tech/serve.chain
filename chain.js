var Cryptr = require('cryptr')
var moment = require('moment')
var express =  require('express')
var app = new express()
var bodyParser = require('body-parser')
var request = require('request')
const publicIp = require('public-ip');
const bytesize = require('bytesize');
var crypto = require('crypto')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var tobinary = require('tobinary');

app.use(urlencodedParser)

/*
# allTxOuts #
An array containing allTxOuts with a genisis transaction to start out
*/

var txOuts = [{from: 'gen', address: 'jordan', value: 100000}];

var value = 100000;

/*
# Peers #
an array containing the hostname of all peers. This has been manually added
*/

var peers = ['localhost:3000', 'localhost:3002'];

/*
# Block #
a constructor to create a block
*/

class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash
    }
}

/*
# Calculate the Hash for a Block
@block {object} - a block to calculate the hash for
Uses the block  index as the key and returns the timestamp of the block encrypted
*/

var calculateHash = (block) => {
  const secret = block.timestamp;
  const hash = crypto.createHmac('sha256', secret)
                   .update(block.index + block.data)
                   .digest('hex');
  return hash
}

/*
#hashToBinary
is the hash of a block converted to binary in order to get the difficulty
*/

var hashToBinary = (hash) => {
  return tobinary(hash)
}

/*
# Create the Genisis Block #
creates a predefined genisis block to be the first block in the blockchain
*/

var getGenesisBlock = () => {
    var data ={txOut: { value: 100000, address: 'jordan' },}

    return new Block(0, "0", 1465154705, data, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

/*
# Blockchain #
The blockchain with genisis block created
*/

var blockchain = [getGenesisBlock()];

/*
# Find the Most Recent block #
takes NO params and returns the last block in the blockchain
*/

var getLatestBlock = () => {
  return blockchain[blockchain.length - 1]
}

/*
# Generate the Next Block #
takes blockData as params
produces a new block based off of own blockchain data
*/

var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var day = moment().format('ll')
    var hour = moment().format('LTS')
    var nextTimestamp = day + ' ' + hour;

    var block = new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData)
    var nextHash = calculateHash(block);
    block.hash = nextHash
    return block
};
console.log(generateNextBlock('j t 6'));
/*
# Check if a block is valid #
takes a new block and previous as params
new block is got from the function generateNextBlock()
previous block is got from the function getLatestBlock()
## Checks for ##
  - valid index - by checking if the previousBlock's index + 1 is equal to the new block index
  - valid previousHash - by checking if the previousBlock's hash is equal to the newBlock's previous hash
  - valid hash - by calculating the hash for the newBlock and checking if it is equal to the newBlock's hash
*/

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

/*
# Check for New Blocks #
checks for new blocks by comparing the length of the current blockchain and a new blockchain
*/

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

/*
# Is Chain Valid #
checks validity of chain by seeing if every block at index i can be validated by the function isValidNewBlock checking the current block at index i and the previous block which should be at i - 1
*/

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

/*
# replaceChain #
takes newBlocks and the blockchain as params
checks for new blocks and then checks if chain is valid
IF true
  new blocks are added to the blockchain
IF false
  received blockchain is invalid
*/

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

/*
# getAllTx #
returns all transactions by searching each blocks data in the blockchin
*/

var getAllTx = (blockchain) => {
  var txOutsAll = []
  for (var i = 0; i < blockchain.length; i++) {
    var transaction = blockchain[i].data
    txOutsAll.push(transaction)
    console.log('transaction',transaction);
  }
  return txOutsAll
}

/*
# Find Unspent txOuts #
checks each txOut in allTxOuts and returns the txOut's with an address equal to the current users address in an array
*/

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

/*
# Create a TxOut #
- takes the params receiver, myAddress, amount, send
- calculates the left over amount by subtracting the send amount from the amount param
TxOut1 - is the txOut the receiver will use {value:1, address: chase}
TxOut2 - is the txOut the sender will use if their are leftOver tokens after sending the amount out of a unspent TxOut
Returns an array of [txOut1, txOut2]
*/

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

/*
# Create a transaction #
- takes a privateKey and the Tx as params
The tx is returned by calling the function createTxOut and returns a transaction object
*/

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

/*
# Create Block with Transaction #
takes blockData as a param. The block data is returned from calling the createTransaction function
Returns the block
*/

var createBlockWithTransaction = (blockData) => {
  var block = generateNextBlock(blockData)
  return block
}

/*
# Check Wait Time
@param {object} - latestBlock - gets the latest block in the blockchain by calling getLatestBlock()
Checks to see if it has been a few seconds since the creation of the last block
*/

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

/*
# Sync Chain #
takes peer is a param which should be the peers port
Performs a ger request and returns the peers chain
*/

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

/*
# Send #
takes the peer, the receiver, and the amount as params
Perforns a post request to the peer and if the block is valid then it is added to the peers blockchain
*/

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

/*
# /blocks #
Allows users to perform a GET request and return all the blocks
*/

app.get('/blocks', (req, res) => {
  res.send(JSON.stringify(blockchain))
})

/*
# /blocks/to/amount #
Allows users to post to a peer and on a request the peers blockchain is updated
*/

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

/*
# /send/to/amount #
Allows users to send data to peers by performing a GET request that performs the function send() which is able to POST data to self and to your peers
*/

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
