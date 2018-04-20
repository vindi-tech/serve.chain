# serve.chain

A package for creating a blockchain and also includes a front end UI to integrate in the last stages of development

***

![](https://cdn.dribbble.com/users/124813/screenshots/4187333/522_icon1-floydworx.png)


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
_______________________________________________________________________________________________________________________________________
_______________________________________________________________________________________________________________________________________
_______________________________________________________________________________________________________________________________________



## Tx.js
A package for interacting and building transactions along with their txIn's and txOut's

![](https://image.slidesharecdn.com/coqbzj2yqqwbi7l00aso-signature-8e37ebc6495c7d6063b42449e4cd455a3188d45846f27819820d9a9e52f6e6b3-poli-150514060710-lva1-app6892/95/bitcoin-cryptocurrency-19-638.jpg?cb=1431583748)

### txOut constructor
The txOut that will correspond with a txIn and will show the value the sender gets in return after spending the original txOut
- @params {object} - the txOut you are going to spend
- @params {string} - the address which will be the new owner
- @params {int} - the amount you are wanting to send
- @params {string} - the id of the txOut

       class txOut {
         constructor(spend, address, value, id) {

             this.spend = spend
             this.address= spend.address
             this.value = spend.value - value
             this.from = address

         }
       }
________________________________________________________________________________________________________________________________________

### txIn constructor
The txIn to send to peer to later be converted to txOut. Shows the value the peer will be receiving
- @params {object} - the txOut you are going to spend
- @params {string} - the address which will be the new owner
- @params {int} - the amount you are wanting to send
- @params {string} - the id of the txOut

       class txIn {
           constructor(spend, address, value, id) {
               this.spend = spend
               this.address= address
               this.value = value
               this.from = spend.address


           }
         }
         
________________________________________________________________________________________________________________________________________

### newTxIn 
A function to create a new txIn
- @params {object} - the txOut you are going to spend
- @params {string} - the address which will be the new owner
- @params {int} - the amount you are wanting to send
- @params {string} - the id of the txOut
- @returns {object} - txIn

#### code : 

       exports.newTxIn = (spend, address, value, id) => {
         var txO = new txIn(spend, address, value, id);
         return txO
       } 

### newTxOut
The txOut showing the leftover balance of the sender.
- @params {object} - *txIn* - the corresponding txIn
- @params {int} - *value* - the amount you are wanting to send
- @params {string} - id - the id of the txOut
- @returns {object} - txOut

       exports.newTxOut = (txIn, value, id) => {
         if (txIn.address === 'bank') {
           var txO = new txOut(txIn.spend, txIn.address, txIn.value, 'cash');
           return txO
         } else {
           var txO = new txOut(txIn.spend, txIn.address, value, id);
           return txO
         }
       }

_______________________________________________________________________________________________________________________________________

### transaction - create a new transaction
Creates the txIn and txOut objects needed for a valid transactions
- @params {object} - the txOut you are going to spend
- @params {string} - the address which will be the new owner
- @params {int} - the amount you are wanting to send
- @params {string} - newTxIn : function
- @params {object} - newTxOut : function
- @returns {object} - trans - the transaction object.


       exports.transaction = (spend, address, value, newTxIn, newTxOut) => {

         var txIn1 = newTxIn(spend, address, value)
         var trans = {
           txIn: txIn1,
           txOut: newTxOut(txIn1)
         }
         return(trans)
       }

_____________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________

# Smart Contracts
![](https://cdn.dribbble.com/users/989466/screenshots/4107749/gems-review-port-dribbble-alex-pasquarella_1x.png)
## trading.js
For deploying a tradeable currency as a Smart Contract

_______________________________________________________________________________________________________________________________________

### updateBalanceState - updates the balance of the sender and receiver object
- @params {object} - peer
- @params {object} - you
- @params {int} - amount
- @returns {object} - balanceState

#### code : 

       var updateBalanceState = (peer, you, amount) => {
         if (amount > you.balance) {
           return 'insufficient funds'
         } else {
           peer.balance = parseInt(peer.balance) + amount;
           you.balance = parseInt(you.balance) - amount
           var obj = {
             [`peer`]:{ balance: parseInt(peer.balance) + parseInt(amount)},
             [`you`]: { balance: parseInt(you.balance) - parseInt(amount)}
           }
           console.log('\nupdated balance state...');
           return obj
       }
       }

_______________________________________________________________________________________________________________________________________
![](https://cdn.dribbble.com/users/721524/screenshots/3895840/bit_hub_03_1x.png)
### Trade Contract a constructor for creating a TradeContract

- @params {string} - creatorAddress
- @params {string} - address
- @params {string} - type
- @params {string} - tokenSymbol
- @params {int} - tokenAmount
- @params {array} - blockchain

### code : 

              class TradeContract {
                constructor(creatorAddress, address, type, tokenSymbol, tokenAmount, blockchain) {

                  this.address = address,
                  this.creatorAddress = creatorAddress;
                  this.type = type
                  this.tokenSymbol = tokenSymbol
                  this.tokenAmount = tokenAmount
                  this.timestamp = moment().format('LTS') + moment().format()
                  this.blockchain = [schain.getContractGenisisBlock(this, schain.calculateHash, '0x00')]
                  this.members = {
                    [`${address}`]: { balance: tokenAmount, type: 'contract', owner: creatorAddress},
                    [`${creatorAddress}`]: {balance:0, type: 'user', }
                  };


                  exec.emit('contract', this)

                  this.execute = {
                    updateBalanceState: updateBalanceState,
                    newTxIn: stx.newTxIn,
                    newTxOut: stx.newTxOut,
                    transaction: stx.transaction,
                    makeTxId: stx.makeTxId,
                    deployContract: function deployContract(blockchain, members) {
                      if (blockchain.length > 0) {
                        console.log('\nsigned transacton at index 0. Ready to load contract to account');
                        var data = {
                            txIn:{
                              spend: blockchain[0].data,
                              from: address,
                              address: creatorAddress,
                              value:tokenAmount,
                              id: stx.makeTxId(`${address}`, this.value, this.from),
                            },
                            txOut:{
                              spend: blockchain[0].data.txIn,
                              from: blockchain[0].data.txIn.address,
                              address: address,
                              value: members[address].balance - tokenAmount,
                              id: stx.makeTxId(`${address}`, `value`, `from`),
                            },
                          }
                          var latest = schain.getLatestBlock(vindicoin.blockchain)
                          var nextBlock =  schain.generateNextBlock(data, latest, vindicoin.blockchain)

                          console.log('next block', nextBlock);
                          if (schain.isValidNewBlock(nextBlock, latest) === true) {
                            console.log('true');
                            vindicoin.blockchain.push(nextBlock)
                            return vindicoin.blockchain.indexOf(nextBlock)
                            // return updateBalanceState(members[`${creatorAddress}`],members[`${address}`], tokenAmount)

                          }

                      }
                    },

                    findUSTXO: schain.findUnspentTx,
                    transaction: function (spend, address, value,newTxIn, newTxOut) {
                      // var txI = new txIn(spend,address,value, currency)
                      // var txO = new txOut(spend, from, address, value, currency)
                      var txIn = newTxIn(spend, address, value, stx.makeTxId(address, value, spend.address))
                      var txOut = newTxOut(txIn, value, stx.makeTxId(txIn.address, value, spend.from))
                      var data = {txIn,txOut}
                      var nextblock = schain.generateNextBlock(data, schain.getLatestBlock(vindicoin.blockchain), vindicoin.blockchain)
                      console.log('\ntransaction!!!!!!\n');
                      console.log();
                      if (schain.isValidNewBlock(nextblock, schain.getLatestBlock(vindicoin.blockchain)) === true) {
                        console.log('true transaction\n');
                        return(nextblock)
                      }
                    }
                  };
                }
              };
_______________________________________________________________________________________________________________________________________

#### TradeContract.members 
A key in the tradecontract json object that holds all the members of the contract. Starting out its only the token address and the creatorAddress

##### code :

           this.members = {
             [`${address}`]: { balance: tokenAmount, type: 'contract', owner: creatorAddress},
             [`${creatorAddress}`]: {balance:0, type: 'user', }
           };
           
##### example : members
 
       members: {
              'xncn03': {balance: 100000, type 'contract', owner: '0x00'},
              '0x00': { balance: 0, type: 'user' }
       }
_______________________________________________________________________________________________________________________________________

#### TradeContract.execute : functions that are able to be executed when interacting with the contract
- updateBalanceState
- newTxIn
- newTxOut
- transaction
- makeTxId
- findUSTXO
- deployContract
_______________________________________________________________________________________________________________________________________
![](https://cdn.dribbble.com/users/721524/screenshots/3893000/artboard_1.png)
#### TradeContract.execute.deployContract()
Allows users to deploy a trading contract. </br>
Upon creation all the tokens belong to the address of the contract but when deployContract is ran it creates a transaction containing the txIn and txOut data of the tokens being moved from the contracts address to the contract creator's address. If the created block is valid it will add the block to the current users blockchain.

- @param {array} - blockchain - the blockchain
- @param {object} - members : the members object containing the current "state" of members and their balance

##### code :
             deployContract: function deployContract(blockchain, members) {
               if (blockchain.length > 0) {
                 console.log('\nsigned transacton at index 0. Ready to load contract to account');
                 var data = {
                     txIn:{
                       spend: blockchain[0].data,
                       from: address,
                       address: creatorAddress,
                       value:tokenAmount,
                       id: stx.makeTxId(`${address}`, this.value, this.from),
                     },
                     txOut:{
                       spend: blockchain[0].data.txIn,
                       from: blockchain[0].data.txIn.address,
                       address: address,
                       value: members[address].balance - tokenAmount,
                       id: stx.makeTxId(`${address}`, `value`, `from`),
                     },
                   }
                   var latest = schain.getLatestBlock(vindicoin.blockchain)
                   var nextBlock =  schain.generateNextBlock(data, latest, vindicoin.blockchain)

                   console.log('next block', nextBlock);
                   if (schain.isValidNewBlock(nextBlock, latest) === true) {
                     console.log('true');
                     vindicoin.blockchain.push(nextBlock)
                     return vindicoin.blockchain.indexOf(nextBlock)
                     // return updateBalanceState(members[`${creatorAddress}`],members[`${address}`], tokenAmount)

                   }

               }
             },

____________________________________________________________________________________________________________________________________
![](https://cdn.dribbble.com/users/1418633/screenshots/3944885/explainer_video_-_studiotale.gif)
#### TradeContract.execute.transaction
Creates txIn and txOut data for transaction, generates the next block with this transaction data, if block is valid then the new block is returned

- @params {object} - the txOut you are spending
- @params {string} - the address that the assets are being transferred to
- @params {int} - the amount to transfer
- @params {function} - newTxIn
- @params {function} - newTxOut
- @returns {object} - nextBlock

      transaction: function (spend, address, value,newTxIn, newTxOut) {
        // var txI = new txIn(spend,address,value, currency)
        // var txO = new txOut(spend, from, address, value, currency)
        var txIn = newTxIn(spend, address, value, stx.makeTxId(address, value, spend.address))
        var txOut = newTxOut(txIn, value, stx.makeTxId(txIn.address, value, spend.from))
        var data = {txIn,txOut}
        var nextblock = schain.generateNextBlock(data, schain.getLatestBlock(vindicoin.blockchain), vindicoin.blockchain)
        console.log('\ntransaction!!!!!!\n');
        console.log();
        if (schain.isValidNewBlock(nextblock, schain.getLatestBlock(vindicoin.blockchain)) === true) {
          console.log('true transaction\n');
          return(nextblock)
        }
      }
      
____________________________________________________________________________________________________________________________________      
