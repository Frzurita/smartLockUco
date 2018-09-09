import express from 'express'
import path from 'path'
import logger from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import methodOverride from 'method-override'
import cors from 'cors'
import httpStatus from 'http-status'
import expressWinston from 'express-winston'
import expressValidation from 'express-validation'
import helmet from 'helmet'
import winstonInstance from './winston'
import routes from '../server/routes/index.route'
import config from './config'
import APIError from '../server/helpers/APIError'

const app = express()

if (['development', 'test'].includes(config.env)) {
  app.use(logger('dev'))
}

// parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())
app.use(compress())
app.use(methodOverride())

// secure apps by setting various HTTP headers
app.use(helmet())

// enable CORS - Cross Origin Resource Sharing
app.use(cors())

// mount all routes on /api path
app.use('/api', routes)

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  console.log(err)
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ')
    // const error = new APIError(unifiedErrorMessage, err.status, true)
    res.status(400).json({code: 400, message: unifiedErrorMessage})
  }
  res.status(400).json({code: 400, message: 'Bad request, something was wrong'})
})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.NOT_FOUND)
  return next(err)
})

app.use(function (err, req, res, next) {
  if (err.message === 'No authorization token was found') {
    res.status(401).json({code: 124, message: err.message})
  } else if (err.message === 'invalid signature') {
    res.status(401).json({code: 125, message: err.message})
  }
})

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance
  }))
}

// error handler, send stacktrace only during development
app.use((err, req, res, next) => // eslint-disable-line no-unused-vars
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: config.env === 'development' ? err.stack : {}
  })
)

export default app
