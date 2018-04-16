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


/*
# Create the Wallet's Private Key #
takes a name as params
  - uses '0x' as the key
  - returns the current directory + name + /walletdata.txt
*/

var createWalletPrivateKey = (name) => {
  var hasher = new Cryptr('0x')
  return hasher.encrypt(__dirname + `${name}` + '/walletdata.txt')
}

/*
# Generate the Wallet's Public Address #
takes the private key as a param
Uses the privateKey as the key and encrypts the privateKey
*/

var generatePublicAddress = (privateKey) => {
  var hasher = new Cryptr(privateKey)

  return hasher.encrypt(privateKey)

}

/*
# Create wallet #
takes an address as a param
the address is calculated by calling generatePublicAddress()
A file is created with the name of your address and containing your address
*/

var createWallet = (address) => {
  fs.writeFile(__dirname + `/${address}`, `${address}`, (err) => {
  if (err) throw err;
  wallets.push(address)
  console.log('wallet has been created',`${address}`);
  });
}
