const jwt = require("jsonwebtoken");
const message = require('../constants/messages')
const { TokenExpiredError } = jwt;

const TokenError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    console.log({ message: "Unauthorized! Access Token was expired!" })
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }
  console.log({ message: "Unauthorized!" })
  return res.status(401).send({ message: "Unauthorized!" });
}

const NoTokenError = res => {
  const response = {
    success: false,
    message: "No token provided!"
  }
  console.log(response)
  return res.status(403).send(response);
}

const ServerError = (err, res) => {
  const response = {
    err: err,
    message: message.ServerError
  }
  console.log(response)
  return res.status(500).send(response)
}

const NotFoundError = (params, res) => {
  const response = {
    success: false,
    message: `${message.NotFound} ${params}`
  }
  return res.status(400).send(response)
}

const AlreadyExistsError = (params, res) => {
  const response = {
    status: 400,
    message: message.AlreadyExists + ' ' + params
  }
  console.log(response)
  return res.status(400).send(response)
}

const PermissionError = res => {
  const response = {
    success: false,
    message: message.checkPermission
  }
  console.log(response)
  return res.status(403).send(response)
}

const HashPasswordError = (verifyPassword, res) => {
  const response = {
    success: false,
    message: verifyPassword.messageError
  }
  console.log(response)
  return res.status(400).send(response);
}

const handleError = {
  TokenError,
  NoTokenError,
  ServerError,
  NotFoundError,
  PermissionError,
  HashPasswordError,
  AlreadyExistsError,
  
}

module.exports = handleError