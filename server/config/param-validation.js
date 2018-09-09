import Joi from 'joi'

export default {
  // POST /api/users
  createUser: {
    body: {
      email: Joi.string().required().min(3).max(50),
      password: Joi.string().required().min(6).max(50)
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      email: Joi.string().email(),
      cardId: Joi.string()
    }
  },

  // /api/investments

  investment: {
    body: {
      product: Joi.string().required(),
      quantity: Joi.number().required(),
      stoploss: Joi.object().keys({
        enabled: Joi.boolean().required(),
        percentage: Joi.number().required(),
        groundPrice: Joi.number().required()
      }),
      buy: Joi.object().keys({
        enabled: Joi.boolean().required(),
        price: Joi.number().required()
      })
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // /trade/*
  order: {
    body: {
      productId: Joi.string().required(),
      price: Joi.number().required(),
      size: Joi.number().required()
    },
    params: {
      exchange: Joi.string().required()
    }
  }
}
