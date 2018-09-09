const statuses = {
  BAD_REQUEST: 400,
  UNNAUTHORIZED: 401,
  FORBIDEN: 403,
  INTERNAL_SERVER_ERROR: 500
}

const standardErrors = {
  MAX_PAGINATION_REACHED: 'Maximun pagination limit reached',
  INCORRECT_PARAMS: 'Incorrect params, please, check our API doc to fix this issue'
}

class APIError {
  constructor (status = 400, message = 'Something wrong happened') {
    this.message = message
    this.status = statuses[status]
    this.response = {
      message: standardErrors[this.message] || this.message,
      status: this.status
    }
  }
}

export default APIError
