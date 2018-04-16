#bytesize

##Installation

`npm install bytesize`

##Usage

```javascript
const bytesize = require('bytesize');

//string size
const size = bytesize.stringSize('1 12 3 123 123');
//size == 14

//string size
const size = bytesize.stringSize('1 12 3 123 123', true);
//size == 14B

//file size (returns a Promise that you can await)
try {
  const size = await bytesize.fileSize(__dirname + '/fixtures/test.txt');
  //size == 6660
} catch(exc) {
  console.log(exc);
}

//pretty file size
try {
  const size = await bytesize.fileSize(__dirname + '/fixtures/test.txt', true);
  //size == '6.50KB'
} catch(exc) {
  console.log(exc);
}

//gzip file size
try{
  const size = await bytesize.gzipSize(__dirname + '/fixtures/test.txt');
  //size == 190
} catch(exc) {
  console.log(exc);
}

//pretty gzip file size
const size = await bytesize.gzipSize(__dirname + '/fixtures/test.txt', true);
//size == '190B'
```
