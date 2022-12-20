exports.Errors = (e) => {
    if(e.code == undefined)
        return res.status(400).json({success: false, errors : {message : e}  }); 

    return true; 

}