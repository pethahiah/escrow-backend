module.exports =  Message = function(type, code=null, invite=null, firstname=null) {
    if(type == 'Registration')
    {
        return '<p>Account Created Successfully. Thank you for Signing up with Us.</p>'
    }
    else if(type == 'ForgotPassword')
    {
        return `<p>
                You have requested for Password Reset. If this is not you, kindly ignore this message. Else, the password reset code is ${code}
                <a href="http://localhost" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; position: relative; color: #3d4852; font-size: 19px; font-weight: bold; text-decoration: none; display: inline-block;">
                    Click this Link to Reset
                </a>
                </p>`
    }
    else if(type == 'ResetPassword')
    {
        return '<p>Password Reset is Successful</p>'
    }
    else if(type == 'Invite To Use Escrow Platform')
    {
        return `<p>
                    ${invite} has invited you to Escrow Platform
                    <a href="http://localhost" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; position: relative; color: #3d4852; font-size: 14px; text-decoration: none; display: inline-block;">
                    Go to Escrow
                    </a>
                </p>`
    }
    else if(type == 'Invite To Transaction')
    {
        return `<p>
                    ${invite} has invited you to Escrow Platform
                    <a href="http://localhost" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; position: relative; color: #3d4852; font-size: 14px; text-decoration: none; display: inline-block;">
                    Go to Escrow
                    </a>
                </p>`
    }
    else if(type == 'Invite To Witness a Transaction')
    {
        return `<p>
                    ${invite} has invited you to Escrow Platform
                    <a href="http://localhost" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; position: relative; color: #3d4852; font-size: 14px; text-decoration: none; display: inline-block;">
                    Go to Escrow
                    </a>
                </p>`
    }

    else if(type == 'Transaction Message')
    {
        return `<p>
                    You have a new Message on a Transaction in Escrow Platform
                    <a href="http://localhost" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; position: relative; color: #3d4852; font-size: 14px; text-decoration: none; display: inline-block;">
                    Go to Escrow
                    </a>
                </p>`
    }

    return '';
}

