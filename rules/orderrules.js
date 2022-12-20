exports.orderrules = {
    name: 'required',
    quantity: 'required|numeric',
    unit_cost: 'required|numeric',
    total_cost: 'required|numeric',
    order_description: 'required',
    mode_of_delivery:'required',
    date_of_delivery:'date',
    transactionId: 'required|numeric'
}

exports.editorderrules = {
    name: 'required',
    quantity: 'required|numeric',
    unit_cost: 'required|numeric',
    total_cost: 'required|numeric',
    order_description: 'required',
    mode_of_delivery:'required',
    date_of_delivery:'date',
    orderId: 'required|numeric'
}