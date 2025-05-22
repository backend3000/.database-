const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const usersPath = path.join(__dirname, 'users.json');

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));

// File Upload Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf8')) : [];
  const match = users.find(user => user.email === email && user.password === password);
  res.send(match ? 'success' : 'fail');
});

// SIGNUP
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  let users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf8')) : [];
  if (users.some(user => user.email === email)) {
    return res.status(409).send('Email already exists');
  }
  users.push({ email, password, image: "" });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.send('signup-success');
});

// UPLOAD IMAGE
app.post('/upload', upload.single('image'), (req, res) => {
  const { email } = req.body;
  if (!req.file || !email) return res.status(400).send({ success: false, message: 'Missing data' });

  const imagePath = `/uploads/${req.file.filename}`;
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf8')) : [];
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) return res.status(404).send({ success: false, message: 'User not found' });

  users[userIndex].image = imagePath;
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.send({ success: true, imageUrl: imagePath });
});

// GET PROFILE INFO
app.get('/profile', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send('Email required');

  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf8')) : [];
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).send('User not found');

  res.json(user);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
