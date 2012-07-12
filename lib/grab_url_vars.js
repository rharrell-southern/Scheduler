function grabUrlVars(name, location)
{
	param = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
    var regexS = "[\\?&]" + name + "=([^&#]*)"
    var regex = new RegExp(regexS)
    var results = regex.exec(location)
    if (results == null)
        return ""
    else
        return decodeURIComponent(results[1].replace(/\+/g, '%20'))

}