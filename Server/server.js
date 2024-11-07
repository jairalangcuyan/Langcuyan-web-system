const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.post('/proxy-webhook', async (req, res) => {
    try {
        const response = await axios.post('https://webhook.site/9174540f-07cb-4cb5-a66e-a31335a912e4', req.body, {
            headers: { 'Content-Type': 'application/json' },
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
