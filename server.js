const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const usersPath = path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));

// Ensure uploads directory exists at startup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit 5MB
  fileFilter: (req, file, cb) => {
    // Optional: accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
  const match = users.find(user => user.email === email && user.password === password);
  res.send(match ? 'success' : 'fail');
});

// SIGNUP
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  let users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
  if (users.some(user => user.email === email)) {
    return res.status(409).send('Email already exists');
  }
  users.push({ email, password, image: '' });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.send('signup-success');
});

// UPLOAD IMAGE
app.post('/upload', upload.single('image'), (req, res) => {
  const { email } = req.body;

  if (!email || !req.file) {
    return res.status(400).json({ success: false, message: 'Missing email or file' });
  }

  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  users[userIndex].image = imagePath;
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.json({ success: true, path: imagePath });
});

// GET PROFILE INFO
app.get('/profile', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).send('Email required');

  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).send('User not found');

  res.json(user);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
