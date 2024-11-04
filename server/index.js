const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const bodyParser = require('body-parser');
const cors = require('cors');
const port =  process.env.PORT || 8080;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uri = 'mongodb+srv://swetakar:1924@cluster0.9c4up.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = 'your_jwt_secret';

const corsOptions = {
    origin: ['http://localhost:3000','https://react-sticky-note-2.onrender.com'],
    methods: 'GET, POST, PUT, DELETE, PATCH',
    credentials: true
};
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json()); //middleware 
// app.use('/api/auth', require('./routes/auth'));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
    },
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Connection error', err);
    });

const itemschema = new mongoose.Schema({
    Title: String,
    Date: String,
    content: String,
    imageUrl: String
});
const Item = mongoose.model('Item', itemschema);

app.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// app.get('/:id', async (req, res) => {
//     try {
//         const item = await Item.findById(req.params.id);
//         if (!item) {
//             return res.status(404).json({ message: 'Item not found' });
//         }
//         res.json(item);
//     } catch (error) {
//         res.status(500).json({ message: error.message });  bnvg'[;lkjbh gvcfxxhnj]
//     }
// });

app.post('/', upload.single('image'), async (req, res) => {
    try {
        const itembody = new Item(req.body);
        if (req.file) {
            itembody.imageUrl = `https://react-sticky-note.onrender.com/uploads/${req.file.filename}`; 
        } else {
            itembody.imageUrl = null;
        }
        const saveditem = await itembody.save();
        res.status(201).json(saveditem);
    } catch (error) {
        console.error('Error saving item:', error); // Log the error
        res.status(400).json({ message: error.message });
    }
});

app.patch('/:id', upload.single('image'), async (req, res) => {
    try {
        const itemid = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(itemid)) {
            return res.status(400).json({ message: 'Invalid item ID format' });
        }
        const updatedItem = await Item.findById(itemid);
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        Object.assign(updatedItem, req.body);
        console.log(req.file)
        if (req.file) {
            updatedItem.imageUrl = `https://react-sticky-note.onrender.com/uploads/${req.file.filename}`;
        }
        // else{
        //     updatedItem.imageUrl = null;
        // }
        const savedItem = await updatedItem.save();
        res.json(savedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE route to handle item deletion
app.delete('/:id', async (req, res) => {
    try {
        const itemid = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(itemid)) {
            return res.status(400).json({ message: 'Invalid item ID format' });
        }
        const deletedItem = await Item.findByIdAndDelete(itemid);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found. Please sign up.' });
      
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password.' });
      
        // Generate JWT including email and name in the payload
        const token = jwt.sign(
            { user: { id: user._id, email: user.email, name: user.name } }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
      
        // Return token and user info (email and name)
        res.json({
          token,
          email: user.email,
          name: user.name,
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});


// Signup Route (make sure this also includes the correct payload)

app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists. Please login.' });
        }

        // Create a new user
        const newUser = new User({ email, password, name });
        await newUser.save();

        // Generate JWT including email and name in the payload
        const token = jwt.sign(
            { user: { id: newUser._id, email: newUser.email, name: newUser.name } }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Return token and user info (email and name)
        res.status(201).json({
            token,
            email: newUser.email,
            name: newUser.name,
        });
    } catch (error) {
        res.status(500).json({ error: 'Signup failed' });
    }
});

  
app.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user information' });
    }
});
// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).send('Unauthorized');
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
};


app.listen(port, () => {
    console.log('server started on port', port);
});
