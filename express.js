const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

let storedNumbers = [];

const fetchNumbers = async (numberId) => {
    const urlMap = {
        'p': 'primes',
        'f': 'fibo',
        'e': 'even',
        'r': 'rand'
    };
    const url = urlMap[numberId];

    if (!url) return [];

    try {
        const response = await axios.get(`http://20.244.56.144/test/${url}`, { timeout: 500 });
        return response.data.numbers || [];
    } catch {
        return [];
    }
};

const updateNumbers = (newNumbers) => {
    newNumbers.forEach(num => {
        if (!storedNumbers.includes(num)) {
            if (storedNumbers.length >= WINDOW_SIZE) {
                storedNumbers.shift();
            }
            storedNumbers.push(num);
        }
    });
};

app.post('/numbers/:numberId', async (req, res) => {
    const startTime = Date.now();
    const numberId = req.params.numberId;

    const numbers = await fetchNumbers(numberId);
    updateNumbers(numbers);

    const windowPrevState = [...storedNumbers];
    const avg = storedNumbers.length ? (storedNumbers.reduce((acc, num) => acc + num, 0) / storedNumbers.length).toFixed(2) : '0.00';

    const responseData = {
        windowPrevState,
        windowCurrState: storedNumbers,
        numbers,
        avg
    };

    if (Date.now() - startTime > 500) {
        return res.status(504).json({ error: 'Request timed out' });
    }

    res.json(responseData);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
