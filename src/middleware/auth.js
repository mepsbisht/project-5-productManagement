const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { isValidId } = require("../validator/validation");

// Authentication
const authentication = function (req, res, next) {
  try {
    let token = req.headers.authorization;

    // checking token
    if (!token)
      return res
        .status(401)
        .send({ status: false, message: "token must be present" });

    const bearer = token.split(" ");
    token = bearer[1];

    // validating the token
    let decoded = jwt.verify(token, "productManagement/39",function (err , decoded){
      if(err){
        let message = err.message == "jwt expired"?"Token is expired":"Token is invalid"
        return res.status(401).send({status:false,message:message})
      }
    else {
      // creating an attribute in "req" to access the token outside the middleware
      req.token = decoded;
      next();
    }
    })
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const authorization = async function (req, res, next) {
  try {
    let userId = req.params.userId;
    let userLoggedIn = req.token.userId;
    if (!isValidId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid format of userId" });
    }

    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: "No such user found" });
    }

    if (userLoggedIn != userId) {
      return res
        .status(403)
        .send({
          status: false,
          message: "You are not authorized to perform this task",
        });
    }


    // creating an attribute in "req" to access the blog data outside the middleware
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { authentication, authorization };
