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

const size = bytesize.stringSize('1 12 3 123 123');
console.log(size);
var allWallets = []
var createWalletPrivateKey = (name) => {
  var hasher = new Cryptr('0x')
  return hasher.encrypt(__dirname + `${name}` + '/walletdata.txt')
}

var generatePublicAddress = (privateKey) => {
  var hasher = new Cryptr(privateKey)

  return hasher.encrypt(privateKey)

}

var createWallet = (address) => {
  fs.writeFile(__dirname + `/${address}`, `${address}`, (err) => {
  if (err) throw err;
  wallets.push(address)
  console.log('wallet has been created',`${address}`);
  });
}
