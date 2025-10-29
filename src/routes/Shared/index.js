import express from 'express';
import { uploadMedia, deleteImage } from '../../controllers/Shared/MediaController.js';


const router = express.Router();

router.post('/upload-media', uploadMedia);
router.delete('/delete-media', deleteImage);

export default router;


