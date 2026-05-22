const axios = require('axios');

const askQuestion = async (questionData) => {

    try {

        const response = await axios.post(
            `${process.env.AI_SERVICE}/assistant/ask`,
            questionData
        );

        return response.data;

    } catch (error) {

        throw new Error('Error communicating with AI Assistant');
    }
};

module.exports = {
    askQuestion
};