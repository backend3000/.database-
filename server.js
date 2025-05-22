const express = require('express');  
const fs = require('fs');  
const path = require('path');  
const bodyParser = require('body-parser');  
const cors = require('cors');  
  
const app = express();  
const PORT = process.env.PORT || 3000;  
  
app.use(cors());  
app.use(bodyParser.urlencoded({ extended: true }));  
app.use(bodyParser.json());  
app.use(express.static('public'));  
  
app.get('/', (req, res) => {  
  res.send('Server is running.');  
});  
  
app.post('/login', (req, res) => {  
  const { email, password } = req.body;  
  const usersPath = path.join(__dirname, 'users.json');  
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));  
  
  const match = users.find(user => user.email === email && user.password === password);  
  if (match) {  
    res.send('success');  
  } else {  
    res.send('fail');  
  }  
});  
  
// New: Signup endpoint  
app.post('/signup', (req, res) => {  
  const { email, password } = req.body;  
  const usersPath = path.join(__dirname, 'users.json');  
  
  let users = [];  
  if (fs.existsSync(usersPath)) {  
    users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));  
  }  
  
  const emailExists = users.some(user => user.email === email);  
  if (emailExists) {  
    return res.status(409).send('Email already exists');  
  }  
  
  users.push({ email, password });  
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));  
  res.send('signup-success');  
});  
  
app.listen(PORT, () => {  
  console.log(`Server running on port ${PORT}`);  
});
