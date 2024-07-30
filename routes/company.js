import express from 'express'
import Company from '../models/company.js';
import User from '../models/user.js';
const router = express.Router();

router.post('/setProfile', async(req,res)=>{
    try{
        let companyData = req.body;
        let newCompany = new Company(companyData);
        await newCompany.save();
        let currUser = await User.findById(req.user._id);
        currUser.company = newCompany;
        await currUser.save();
        res.json({ success: 'Company Profile set' });
    }catch(error){
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/profile', async(req,res)=>{
    try{
        let company = await Company.findById(req.user.company);
        res.json(company);
    }catch(error){
        res.status(500).json({error: 'Server error'});
    }
})

router.put('/profile', async(req,res)=>{
    try{
        let company = await Company.findByIdAndUpdate(req.user.company, req.body);
        await company.save();
        res.json({message: 'Company Profile Updated'});
    }catch(error){
        res.status(500).json({error: 'Server error'});
    }
})

export default router;