const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // <-- This line is what you need for JSON data from frontend
app.use(express.static('public'));

// Optional: add this route so visiting the root URL doesn't show an error
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
