const getStateInitials = require("./getStateInitials");

const generateItemID = (state, harvestDate) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().substr(-2);
    const harvestMonth = (harvestDate.getMonth() + 1).toString().padStart(2, '0');
    const randomID = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const stateInitials = getStateInitials(state)
    return `GL-${stateInitials}-${harvestMonth}-${year}${randomID}`;
};

const generateSellerID = (state) => {
    const stateInitials = getStateInitials(state)
    const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return `S-${stateInitials}-${randomId}`;
};

const generateBuyerID = (state) => {
    const stateInitials = getStateInitials(state)
    const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return `B-${stateInitials}-${randomId}`;
};

const generateOrderID = (state) => {
    const stateInitials = getStateInitials(state)
    const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return `GL-OD-${ stateInitials }-${ randomId }`;
};

const generateTransporterId = (state) => {
    const stateInitials = getStateInitials(state)
    const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return `T-${stateInitials}-${ randomId }`;

}

const generateVehicleId = () => {
    const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return `VC-$-${ randomId }`;
}
module.exports = { generateItemID, generateSellerID, generateBuyerID, generateOrderID, generateTransporterId, generateVehicleId };