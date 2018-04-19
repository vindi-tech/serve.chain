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

#### Code 
        class Block {
          constructor(index, previousHash, timestamp, data, hash) {
            this.index = index;
            this.previousHash = previousHash
            this.timestamp = timestamp;
            this.data = data;
            this.hash = hash
          }
          }
#### Example
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
