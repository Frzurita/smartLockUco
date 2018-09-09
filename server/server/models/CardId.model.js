import mongoose from 'mongoose'

const Schema = mongoose.Schema

/**
 * Permission Schema
 */
const SchemaInstance = new Schema({
  number: {
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
  async getId () {
    const ids = await this.find()
    let id = ids[0]
    if (!id) {
      id = new this()
      id.number = 1
      id.save()
    }
    return id.number
  },
  async addOne () {
    const ids = await this.find()
    const id = ids[0]
    id.number += 1
    id.save()
  }
}

/**
 * @typedef Schema
 */
export default mongoose.model('CardId', SchemaInstance)
