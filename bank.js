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

/*
Total Mint
The total amount of currency in circulation
*/

const totalMint = 100000;

/*
Total Cash
The total amount of cash a given vindi.bank has
*/

var totalCash = '';

/*
Bank
a constructor to create a bank. A bank should exist of the following :
- bank name
- bank address
- owner
- balance
*/

class Bank {
  constructor(name, address, owner, cash) {
    this.name = name;
    this.address = address;
    this.owner = owner;
    this.balance = {
      'vindi.coin':'',
      'cash':cash
    }
  }
};

/*
Create Bank Transaction
*/

var createBankTransaction = (txOut) => {
  console.time('exchange')
  var vncValue = 0.001;
  var requested = vncValue * txOut.value
  console.log(`New exchange : ${txOut.value} VNC for ${requested} USD`);
  console.timeEnd('exchange')

  return requested
}

console.log(createBankTransaction({value:12}));

var createBank = (bankName, key) => {
  console.time('createBank')

  var bank = new Bank(bankName, 'a', 'jordan', 0.89)
  console.timeEnd('createBank')
  return bank
}
console.log(createBank('bank2', 'j'));
