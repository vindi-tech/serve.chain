# serve.chain
A package for creating a blockchain and also includes a front end UI to integrate in the last stages of development

## Chain.js 
A package for interacting with blocks and the blockchain


#### Block - *a constructor used to create a block.*
@constructor Block </br>
@param {integer} - *index* - the index of the block </br>
@param {string} - *previousHash* </br>
@param {string} - *timestamp* </br>
@param {object} - *data* - contains the Transaction in the block which contains the txIn and txOut objects </br>
@param {string} - *hash* - the SHA256 encrypted hash of the timestamp + previousHash + index </br>
A constructor used to create a block.

##### code :            
       class Block {
          constructor(index, previousHash, timestamp, data, hash) {
            this.index = index;
            this.previousHash = previousHash
            this.timestamp = timestamp;
            this.data = data;
            this.hash = hash
          }
          }
          
##### Example
    {
      index: 1,
      previousHash: '0x020200ws0s0dddd0',
      timestamp 'April 18, 2018 11:00:03 p.m.',
      hash: '0xmccccccccc,
      data: {
        txIn: {}
        txOut:{}
      }
    }
________________________________________________________________________________________________________________________________________
    
#### getLatestBlock - Gets the latest block in the blockchain
- @param {array} - blockchain
- @returns {object} - latestBlock 

##### Code

      exports.getLatestBlock = (blockchain) => { return blockchain[blockchain.length - 1]}

________________________________________________________________________________________________________________________________________

#### generateNextBlock - Generates the next block in the blockchain
- @param {object} - blockData
- @param {object} - latest
- @param {array} - blockchain

##### Code

      exports.generateNextBlock = (blockData, latest, blockchain) => {
          var previousBlock = latest;
          var nextIndex = previousBlock.index + 1;
          var day = moment().format('ll')
          var hour = moment().format('LTS')
          var nextTimestamp = day + ' ' + hour;
          var block = new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData)
          var nextHash = calculateHash(block)
          block.hash = nextHash
          return block
      };

________________________________________________________________________________________________________________________________________
#### isValidNewBlock
Checks the validity of a newly created block
- @params {object} - newBlock
- @params {object} - previousblock - retrieved from calling function getLatestBlock()
- @returns {boolean} - true or false

##### Code 

    exports.isValidNewBlock = (newBlock, previousBlock) => {
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

________________________________________________________________________________________________________________________________________

#### isValidChain 
Checks to see if a chain is valid by doing isValidNewBlock for every block. The starting new block index is 1 and the latestBlock is the newblock index - 1
- @params {array} - the current chain to validate
- @returns {boolean} - true - if the chain is valid
- @returns {boolean} - false - if the chain is not.

Note - this is validating a whole chain by validating each block in the chain

##### Code

        exports.isValidChain = (chain, blockchain) => {
          for (var i = 1; i < chain.length; i++) {
            if (isValidNewBlock(chain[i], chain[i - 1])) {

              console.log('valid chain');
              return true
            } else {
              return false
            }
          }
        }
________________________________________________________________________________________________________________________________________

 #### replaceChain - determines whether or not to replace the blockchain
 ##### If new blocks are found they are validated and added to the chain
 
   - @params {array} - * newBlocks - retriecved from running checkForNewBlocks()
   - @params {array} - blockchain - the full blockchain
   
         exports.replaceChain = (newBlocks, blockchain) => {
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
________________________________________________________________________________________________________________________________________           
#### getAllTx - gets all txIns
txIns are the data being sent to another user and contains the transaction info they will need to receive the funds

- @params {array} - **blockchain**

##### Code :

        exports.getAllTx = (blockchain) => {
          var txOutsAll = []
          for (var i = 0; i < blockchain.length; i++) {
            var transaction = blockchain[i].data.txIn
            txOutsAll.push(transaction)
            console.log('transaction',transaction);
          }
          return txOutsAll
        }
________________________________________________________________________________________________________________________________________

#### send - allows user to send data to peers
When a user does a GET request to the send API it performs this function which performs a post request to the peer. Express is used to handle this post request and if the newBlock is validated it is added to your peers chain
- @params {string} - peer : the address of your peer
- @params {string} - to : the address of the peer receiving the funds
- @params {int} - amount : the amount you want to send

##### Code :

        exports.send = (peer, to, amount) => { // performs a post request to your peers address
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
________________________________________________________________________________________________________________________________________
