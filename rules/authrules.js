exports.authregister = {
    firstname: 'required|alpha',
    lastname: 'required|alpha',
    email: 'required|email',
    password: 'required|min:8|alpha_num|confirmed'
}

exports.authlogin = {
    email: 'required|email',
    password: 'required'
}

exports.authforgotpassword = {
    email: 'required|email'
}

exports.authresetpassword = {
    code: 'required',
    password: 'required|min:8|alpha_num|confirmed'
}
