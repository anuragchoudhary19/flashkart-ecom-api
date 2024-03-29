const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const requestIp = require('request-ip');
require('dotenv').config();

//app
const app = express();

//db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((res) => console.log('DB CONNECTED'))
  .catch((err) => console.log('DB CONNECTION ERR', err));

//middleware
app.use(cors());
app.options('*', cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '2mb' }));
app.use(requestIp.mw());
//route middleware
app.get('/health', (req, res) => {
  return res.send('ok');
});
fs.readdirSync('./routes').map((r) => app.use('/api', require('./routes/' + r)));

//port
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on ${port}`));
