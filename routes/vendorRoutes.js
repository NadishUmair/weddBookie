
const express=require('express');
const { authenticateToken } = require('../middleware/userAuth');
const { CreateVenue, UpdateVenue } = require('../controllers/vendorController');


const router=express.Router();


router.route('/create-venue/:id').post(authenticateToken,CreateVenue);
router.route('/update-venue/:id').post(authenticateToken,UpdateVenue);

module.exports=router