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

var txOuts = [{id:'0x000001100',from:'gen', address:'jordan', value:100000}]
var uSTXO = []
var makeTxId = (address, value, from) => {
  var hasher = new Cryptr(address)
  var tx = {
    from:from,
    address: this.address,
    value :value,

  }
  var hash = hasher.encrypt(address + from + value)
  return hash
}

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

class txOut {
  constructor(spend, from, address, value) {

    this.txOut = {
      address: from,
      from: address,
      value : spend.value - value,
      id: makeTxId(from, [`value`], address)
    }

  }
}

class txIn {
  constructor(spend, from, address, value) {
    this.txIn = {
      address: address,
      value : spend.value,
      id: makeTxId(address, [`value`], from)
    }
  }
}
console.log(new txIn(txOuts[0],'jordan', 'chase', 100000));
console.log(new txOut(txOuts[0],'jordan', 'chase', 100000));
