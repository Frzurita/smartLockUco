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
  areaId: {
    type: Schema.Types.ObjectId,
    ref: 'Area',
    required: true
  },
  capacity: {
    type: Number,
    default: 1
  },
  available: {
    type: Boolean,
    default: true
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
export default mongoose.model('Lock', SchemaInstance)
