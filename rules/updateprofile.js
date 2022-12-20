exports.profileupdate = {
    state: 'required|numeric',
    country: 'required|numeric',
    city: 'required|numeric',
    gender:'required',
    address:'required',
    phone_number:'required|numeric|min:11'
}

exports.accounttype = {
    account_type: 'required|in:Individual,Business'
}