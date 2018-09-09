import mongoose from 'mongoose'
import { userRoles } from '../helpers/statuses'

const Schema = mongoose.Schema

/**
 * User Schema
 */
const SchemaInstance = new Schema({
  email: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String
  },
  role: {
    type: Number,
    default: userRoles.normal
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
SchemaInstance.method({
})

/**
 * Statics
 */
SchemaInstance.statics = {
  findByEmail (email) {
    return this.findOne({ email })
      .exec()
      .then((user) => {
        if (user) {
          return user
        }
        return undefined
      })
  }
}

/**
 * @typedef User
 */
export default mongoose.model('User', SchemaInstance)
