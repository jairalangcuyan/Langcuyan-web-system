const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// Endpoint to handle webhook requests
app.post('/send-webhook', async (req, res) => {
    const webhookUrl = 'https://webhook.site/f5be449c-fc19-45e1-8b4a-32a6889bf60d';  // Example Webhook URL

    console.log('Received data:', req.body);

    try {
        console.log('Sending data to webhook:', req.body);  // Log data being sent

        const response = await axios.post(webhookUrl, req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Webhook response:', response.data);  // Log the response from the webhook
        res.status(200).json({ message: 'Data sent to webhook successfully', data: response.data });
    } catch (error) {
        console.error('Error sending data to webhook:', error);

        // Provide more detailed logs
        if (error.response) {
            console.error('Webhook error response:', error.response.data);
            console.error('Webhook error status:', error.response.status);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error message:', error.message);
        }

        res.status(500).json({ message: 'Failed to send data to webhook', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Node server is running on http://localhost:${PORT}`);
});
