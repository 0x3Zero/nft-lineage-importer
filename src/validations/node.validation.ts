import Joi from 'joi';

const publishBatchTxs = {
  body: Joi.object().keys({
    contract_address: Joi.string().required(),
    meta_contract_id: Joi.string().allow('').optional(),
    network: Joi.string().required().valid('homestead', 'matic', 'bsc', 'arbitrum', 'celo'),
    token_address: Joi.string().required(),
  }),
};

export default {
  publishBatchTxs,
};
