const getStateInitials = require('./getStateInitials');

const generateItemID = (state, harvestDate) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().substr(-2);
  const harvestMonth = (harvestDate.getMonth() + 1).toString().padStart(2, '0');
  const randomID = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const stateInitials = getStateInitials(state);
  return `GL-${stateInitials}-${harvestMonth}-${year}${randomID}`;
};

const generateSellerID = (state) => {
  const stateInitials = getStateInitials(state);
  const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
  return `S-${stateInitials}-${randomId}`;
};

const generateBuyerID = (state) => {
  const stateInitials = getStateInitials(state);
  const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
  return `B-${stateInitials}-${randomId}`;
};

const generateOrderID = (state) => {
  const stateInitials = getStateInitials(state);
  const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
  return `GL-OD-${ stateInitials }-${ randomId }`;
};

const generateTransporterId = (state) => {
  const stateInitials = getStateInitials(state);
  const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
  return `T-${stateInitials}-${ randomId }`;
};

const generateVehicleId = () => {
  const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
  return `VC-${ randomId }`;
};

const generateHubId = (transporterID, hubPinCode) => {
  // seperate the last numeric digit from transporterID if it look like T-AS-270568
  const transporterIDArray = transporterID.split('-');
  const transporterIDNumber = transporterIDArray[2];
  return `${transporterIDNumber}-${hubPinCode}`;
};

const generateAgriJodVerificationId = () => {
  const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
  return `AJVR-${ randomId }`;
};

const generateTransectionId = () => {
  const date = Date.now().toString();
  const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `TXN${date}${randomString}`;
};
module.exports = {generateItemID, generateSellerID, generateBuyerID, generateOrderID, generateTransporterId, generateVehicleId, generateHubId, generateAgriJodVerificationId, generateTransectionId};
