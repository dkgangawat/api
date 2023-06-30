const regex = {
    email: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    phone: [/^\d{10}$/, 'Phone number should be 10 digits'],
    bankAccountNumber: [/^\d{9,18}$/, 'Account number should be 9 to 18 digits'],
    ifscCode: [/^[A-Za-z]{4}\d{7}$/, 'Invalid IFSC code'],

}

module.exports = regex;