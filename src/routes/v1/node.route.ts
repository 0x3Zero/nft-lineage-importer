import { Router } from 'express';
import { nodeController } from '../../controller';
import { validateRequest } from '../../utils';
import { nodeValidation } from '../../validations';

const router = Router();

router
  .route('/publish_batch_txs')
  .post(validateRequest(nodeValidation.publishBatchTxs), nodeController.publishBatchTxs);

export default router;
