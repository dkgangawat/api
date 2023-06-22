function generateItemID(state, harvestDate) {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().substr(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const harvestMonth = (harvestDate.getMonth() + 1).toString().padStart(2, '0');
    const randomID = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const stateInitials = state.toUpperCase().replace(/\s+/g, '').substring(0, 2);
    return `GL-${stateInitials}-${harvestMonth}-${year}${randomID}`;
}

const generateSellerID = (state) => {
    const stateInitials = state.toUpperCase().replace(/\s+/g, '').substring(0, 2);
    const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return `S-${stateInitials}-${randomId}`;
}

const generateBuyerID = (state) => {
    const stateInitials = state.toUpperCase().replace(/\s+/g, '').substring(0, 2);
    const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return `B-${stateInitials}-${randomId}`;
}

const generateOrderID = (state) => {
    const stateInitials = state.toUpperCase().replace(/\s+/g, '').substring(0, 2);
    const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return `GL-OD-${ stateInitials }-${ randomId }`;
}
module.exports = { generateItemID, generateSellerID, generateBuyerID, generateOrderID }