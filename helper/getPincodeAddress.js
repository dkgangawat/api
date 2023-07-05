const axios = require('axios');

const getPincodeAddress = async (pincode) => {
    try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)
            const data = response.data[0].PostOffice[0]
            const address = `${data.District},${data.State}`
        return address
    } catch (error) {
        console.log(error)
        return null
    }
}
module.exports = getPincodeAddress