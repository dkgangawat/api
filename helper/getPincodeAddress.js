const axios = require('axios');
const config = require('../config/config');

const getPincodeAddress = async (pincode) => {
    try {
        const response = await axios.get(`${config.POSTAL_ADDRESS_API}/${pincode}`);
        if (response && response.data) {
            const data = response.data[0]?.PostOffice[0];
            if (data) {
                console.log(data);
                const address = `${data.District}, ${data.State}`;
                return address;
            }
        }
        return null
    } catch (error) {
        console.log(error)
        return null
    }
}
module.exports = getPincodeAddress