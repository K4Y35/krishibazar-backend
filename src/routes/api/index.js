import express from 'express';
import { uploadMedia, deleteImage } from '../../controllers/Shared/MediaController.js';

const router = express.Router();

router.post('/upload', uploadMedia);
router.post('/delete-image', deleteImage);
export default router;


