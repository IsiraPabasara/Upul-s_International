import { Router } from 'express';
import { handlePayHereNotify } from './payhere.controller';


const router = Router();

// PayHere sends a POST request to this URL
router.post('/notify', handlePayHereNotify);

export default router;