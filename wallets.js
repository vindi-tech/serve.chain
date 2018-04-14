var Cryptr = require('cryptr')
var moment = require('moment')
var express =  require('express')
var app = new express()
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require('fs')
var createWalletPrivateKey = (name) => {
  var hasher = new Cryptr('0x')
  return hasher.encrypt(__dirname + `${name}` + '/walletdata.txt')
}
console.log(createWalletPrivateKey(''));

var generatePublicAddress = (privateKey, wallet) => {
  var hasher = new Cryptr(privateKey)

  return hasher.encrypt(wallet)

}
console.log();
var createWallet = (address) => {
  fs.writeFile(`${address}`, address, (err) => {
  if (err) throw err;

  console.log('wallet has been created',`${address}`);
});
}
console.log(createWallet(generatePublicAddress('ce4f1cfbae4a4446fab7da960dd096b1ea2df536de8552535387c375891b34ad590f8cc3b26ffd5eb4b457d5f334d3ba2434d8610a2f3fb944b424b3c5903f62', '00')));
