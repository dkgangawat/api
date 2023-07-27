const axios = require('axios');
const config = require('../config/config');

const getPincodeAddress = async (pincode) => {
    try {
        const response = await axios.get(`${config.POSTAL_ADDRESS_API}/${pincode}`)
            const data = response.data[0].PostOffice[0]
            const address = `${data.District},${data.State}`
        return address
    } catch (error) {
        console.log(error)
        return null
    }
}
module.exports = getPincodeAddress