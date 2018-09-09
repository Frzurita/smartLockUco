import mongoose from 'mongoose'

const Schema = mongoose.Schema

/**
 * Access Schema
 */
const SchemaInstance = new Schema({
  cardId: {
    type: Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  lockId: {
    type: Schema.Types.ObjectId,
    ref: 'Lock',
    required: false
  },
  areaId: {
    type: Schema.Types.ObjectId,
    ref: 'Area',
    required: false
  },
  start: {
    type: Date,
    default: Date.now
  },
  end: {
    type: Date,
    required: false
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
export default mongoose.model('Access', SchemaInstance)
