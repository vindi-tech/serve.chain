var Cryptr = require('cryptr')
var moment = require('moment')
var express =  require('express')
var app = new express()
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var math = require('math')
var fs = require('fs')
var program = require('commander');
const bytesize = require('bytesize');

var txOuts = [{id:'0x000001100',from:'gen', address:'jordan', value:100000}] // all tax outs

var uSTXO = [] // used to store unspent txOuts

/*
Makes the txId by using the receiving address as the preimage and and encrpts the address, from, and the value
*/

var makeTxId = (address, value, from) => { // makes the txid by using the params.
  var hasher = new Cryptr(address)
  var tx = {
    from:from,
    address: this.address,
    value :value,

  }
  var hash = hasher.encrypt(address + from + value)
  return hash
}

/*
Tx
Create a txIn and txOut in 1 signle object called a Tx
*/

class Tx {
  constructor(spend, from, address, value) {
    this.spend = spend;
    this.txIn = {
      address: address,
      value : this.spend.value,
      id: makeTxId(address, [`value`], from)
    }
    this.txOut = {
      address: from,
      from: address,
      value : this.spend.value - value,
      id: makeTxId(from, [`value`], address)
    }

  }
}

/*
txOut
creates a txOut or the remainder balance in the form of a returned payment from a peer  after a txIn is received from you
*/

class txOut {
  constructor(spend, from, address, value, currency) {

      this.spend = spend
      this.currency = currency
      this.address= from,
      this.from= from,
      this.value = spend.value - value,
      this.id= makeTxId(from, [`value`], address)


  }
}

/*
txIn
Creates a txIn which is the tx that goes to the new owner
*/

class txIn {
    constructor(spend, address, value, currency) {
        this.spend = spend,
        this.fromId= spend.id,
        this.from= spend.address,
        this.address= address,
        this.value = spend.value,
        this.id= makeTxId(address, [`value`], `from`)

    }
  }

/*
A function to create a new txOut
if the address is bank the txOut currency will be usd and the txin currency will be vindi.coin
*/

var newTxOut = (txIn) => {
  if (txIn.address === 'bank') {
    var txO = new txOut(txIn.spend, txIn.from, txIn.address, txIn.value, 'cash');
    return txO
  } else {
    var txO = new txOut(txIn.spend, txIn.from, txIn.address, txIn.value, txIn.currency);
    return txO
  }
}

/*
A function to create a new txIn
*/

var newTxIn = (spend, address, value, currency) => {
  var txO = new txIn(spend, address, value, currency);
  return txO
}

/*
A function that creates a new transaction by returning an object containing a txIn and tOut
*/

var transaction = (spend, address, value) => {

  var txIn1 = newTxIn(spend, address, value)
  var trans = {
    txIn: txIn1,
    txOut: newTxOut(txIn1)
  }
  return(trans)
}

console.log(transaction(txOuts[0], 'chase', 100000));

var testTransactionSpeed = (size) => {
  console.time('tSpeed')
  for (var i = 0; i < size; i++) {
    transaction(txOuts[0], 'chase', 100000) ;

  }
  console.timeEnd('tSpeed')

  return `Just tested the speed of ${size} transactions`

}
console.log(testTransactionSpeed(1000));
