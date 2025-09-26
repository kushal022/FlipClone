import express from 'express';
import { requireSignIn } from '../middleware/authMiddleware.js';
import { addReviewController } from '../controllers/review/addReview.js';
import { getReviewsController } from '../controllers/review/getReview.js';
const router = express.Router();

// get reviews:
router.get('/get-review/:productId', getReviewsController)
// add Reviews:
router.post('/add-review', requireSignIn, addReviewController);


export default router;