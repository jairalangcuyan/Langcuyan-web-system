const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// Endpoint to handle webhook requests
app.post('/send-webhook', async (req, res) => {
    const webhookUrl = 'https://webhook.site/f5be449c-fc19-45e1-8b4a-32a6889bf60d'; // Example Webhook URL

    console.log('Received data:', req.body);

    try {
        console.log('Sending data to webhook:', req.body); // Add logging for data being sent

        const response = await axios.post(webhookUrl, req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Webhook response:', response.data); // Log the response from the webhook

        res.status(200).json({ message: 'Data sent to webhook successfully', data: response.data });
    } catch (error) {
        console.error('Error sending data to webhook:', error);
        res.status(500).json({ message: 'Failed to send data to webhook', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Node server is running on http://localhost:${PORT}`);
});
