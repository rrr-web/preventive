const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt =require('bcryptjs')
const router =  express.Router()
const prisma = require('../db/config')

const JWT_SECRET = process.env.TOKEN_SECRET


router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: 'Username sudah digunakan' });
    }
  });

router.post('/', async (req, res) => {
    const { username, password } = req.body;
  
    const user = await prisma.user.findUnique({ where: { username } });
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
  
    // Membuat token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h',
    });
  
    res.json({ token });
  });

  



export default router