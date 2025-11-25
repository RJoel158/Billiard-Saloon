require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Mount routes created in src/
app.use('/api/v1/users', require('./src/routes/user.routes'));

app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

// Global error handler (from src/middlewares)
const { errorHandler } = require('./src/middlewares/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
