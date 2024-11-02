const express = require('express')
const dotEnv = require('dotenv')
const cors = require('cors')
const {PrismaClient} = require('@prisma/client')
const jwt = require('jsonwebtoken')
const bcrypt =require('bcryptjs')

const prisma = new PrismaClient()

dotEnv.config()
const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT
const JWT_SECRET = 'preventive_login'

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const user = await prisma.user.create({
        data: {
          username,
          role,
          password: hashedPassword,
        },
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: 'Username sudah digunakan' });
    }
  });

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { username } });
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Sorry, Username or Password is Incorect!' });
    }
  
    // Membuat token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h',
    });
  
    res.json({ token });
  });

  
  // Middleware untuk memverifikasi token
  const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.sendStatus(403);
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  };
  
  // Halaman home yang dilindungi
  app.get('/home', authenticateJWT, (req, res) => {
    res.send(`Selamat datang, ${req.user.username}!`);
  });


  app.get('/users', async (req, res) =>{
    const dataUsers = await prisma.user.findMany()
    res.send(dataUsers).sendStatus(200)
  })
  
  app.listen(PORT, ()=>{
    console.log(`express listen Port ${PORT}`);
    
  })