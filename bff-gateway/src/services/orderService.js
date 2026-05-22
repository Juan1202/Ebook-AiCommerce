const axios = require('axios');

const createOrder = async (orderData) => {

    try {

        const response = await axios.post(
            `${process.env.ORDER_SERVICE}/orders`,
            orderData
        );

        return response.data;

    } catch (error) {

        throw new Error('Error creating order');
    }
};

module.exports = {
    createOrder
};