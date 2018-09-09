import mongoose from 'mongoose'

const Schema = mongoose.Schema

/**
 * Permission Schema
 */
const SchemaInstance = new Schema({
  name: {
    type: String,
    required: true,
    index: { unique: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

/**
 * Methods
 */
SchemaInstance.method({})

/**
 * Statics
 */
SchemaInstance.statics = {}

/**
 * @typedef Schema
 */
export default mongoose.model('Area', SchemaInstance)
