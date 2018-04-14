var express = require('express')
var app = new express();
var Cryptr = require('cryptr')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser)
// var web3 = require('web3')
var buttonOptions = ['balance', 'wallet', 'send']
const publicIp = require('public-ip');

publicIp.v4().then(ip => {
    console.log(ip);
    //=> '46.5.21.123'
});

publicIp.v6().then(ip => {
    console.log(ip);
    //=> 'fe80::200:f8ff:fe21:67cf'
});

var drivers = {
  'Dayton': {
    drivers:['jay']
  }
}



// eth key S5Q5wXX319J6Glb4





var all =[]


var cryptr = new Cryptr('1')



app.set('view engine', 'ejs')


app.get('/bg', (req, res) => {
  res.sendFile('C:/Users/jmhayes95/Documents/serve/chain.png')
})

var user ={}

var accounts = [
  {
    name:'jordan',
    password:'pp',
    hobbies:[],
    address:'',
    currentOrders:[]
  },
  {
    name:'chase',
    password:'000'
  }
]

app.get('/sign/:name/:key', (req, res) => {
  var name= req.params.name
  var password = req.params.key
  for (var i = 0; i < accounts.length; i++) {
    var acc = accounts[i]
    if (acc.name === name && acc.password === password) {
      user = acc
      res.send(user)
    } else {
      res.send('no')
    }

  }
})


app.get('/profile', (req, res) => {
 var all = all
  res.render('profile', {buttonOptions, user, body:req.body})
})


app.get('/css', (req, res) => {
  res.render('C:/Users/jmhayes95/Documents/serve/materialize.min.css')
})

app.get('/dash', (req, res) => {
  res.render('dashboard', {buttonOptions, user})
})

app.get('/addInformation/:address/:age/', (req, res) => {
  user.address = req.params.address
  user.age = req.params.age
  res.render('profile', {user})
})

app.get('/drivers/:city', (req, res) => {
  var allDrivers = drivers[req.params.city].drivers
  res.send(allDrivers)
})

app.post('/profile', urlencodedParser, function (req, res) {

  if (!req.body) return res.sendStatus(400)
  var body = req.body
  var encrypt = cryptr.encrypt(req.body.message)
  body.hash = encrypt
  all.push(encrypt)
  console.log(all);
  res.render('profile', {user, body, buttonOptions})
})

app.listen(3002, () => {
  console.log('ready');
})
