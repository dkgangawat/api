function generateItemID(state, harvestDate) {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().substr(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const harvestMonth = (harvestDate.getMonth() + 1).toString().padStart(2, '0');
    const randomID = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const stateInitials = state.toUpperCase().replace(/\s+/g, '').substring(0, 2);
    return `GL-${stateInitials}-${harvestMonth}-${year}${randomID}`;
}

module.exports = { generateItemID }