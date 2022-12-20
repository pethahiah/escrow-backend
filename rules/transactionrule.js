exports.transactionwithrule = {
    name : "required",
    email: "required|email",
    otherparty_category: "required|in:Buyer,Seller",
    transactionId: "required|numeric"
}

exports.transactionupdate = {
    status : "required",
    transactionId: "required|numeric"
}

exports.transaction_doc = {
    transactionId: "required|numeric"
}

exports.witnessrule = {
    name : "required",
    email: "required|email",
    transactionId: "required|numeric"
}

