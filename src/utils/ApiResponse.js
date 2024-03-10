class ApiResponse {
    constructor(statusCode,data,message = "success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}




/* 
info response - 100-199
successful - 200-299
redirecrion - 300-299
client error response - 400 -499
server error  -  500 - 599
*/