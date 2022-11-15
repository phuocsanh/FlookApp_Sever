const messages = {
  // mongoose connect messages
  mongoDBSuccess : 'MongoDB connected successfully',
  mongoDBError: 'mongoose connected error',

  
  // validate messages
  validatePassword : "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
  validateUserName: 'Name cannot contain special characters.',
  validatePhone: 'Invalid phone number',
  validateRating: 'Invalid rating number',


  // catch error messages
  ServerError: 'Server error',
  LoginFailed: 'Login failed',
  CreateFail: 'Create Fail',
  UpdateFail: 'Update Fail',
  DeleteFail: 'Delete Fail',
  NotFound:'Not found',
  InvalidPassword: 'Invalid Password!',
  AlreadyExists: 'Already Exists',
  checkPermission :'Check your permisson',
  NotMatchPassword: 'Password and password comfirm not match',
  UpdatePasswordFail:"Update Password Fail",

  // success messages
  LoginSuccessfully : 'Login successfully',
  CreateSuccessfully: 'Create Successfully',
  UpdateSuccessfully: 'Update Successfully',
  DeleteSuccessfully: 'Delete Successfully',
  GetDataSuccessfully:'Get Data Successfully',
  GetDataNotSuccessfully:'Get Data Not Successfully'
  
}


module.exports = messages