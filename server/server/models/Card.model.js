import mongoose from 'mongoose'
import CardId from './CardId.model'

const Schema = mongoose.Schema

/**
 * Permission Schema
 */
const SchemaInstance = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  nfcCredentials: {
    type: Number,
    required: true
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
SchemaInstance.statics = {
  async create () {
    let card = new this()
    card.nfcCredentials = await CardId.getId()
    CardId.addOne()
    await card.save()
    return card
  }
}

/**
 * @typedef Schema
 */
export default mongoose.model('Card', SchemaInstance)
