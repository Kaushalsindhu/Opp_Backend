import express from 'express'
import passport from 'passport';
import User from '../models/user.js';
import multer from 'multer'
import { storage } from '../cloudConfig.js';
const upload = multer({storage});
const router = express.Router();

router.post('/register', async (req, res) => {
    try{
        const { username, password, email, category } = req.body;
        let registeredUser = await User.register(new User({ username, email, category }), password); 
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            res.json({success:'Registration Successful'});
        })
    } catch (error) {
        res.json({error:error.message});
    }
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), async (req, res) => {
    try{
        res.redirect('/api/user/login/protected');
    } catch (error) {
        console.log(error);
        res.json({message: 'Login Unsuccessful', user: null});
    }
});

router.get('/login/protected', async(req,res)=>{
    try{
        if(req.user){
            res.json({success: 'Login Successful', user: req.user});
        }else{
            res.json({error: 'Incorrect Username or Password', user: req.user});
        }
    }catch (error) {
        console.log(error);
        res.json({error: 'Login Unsuccessful', user: null});
    }
})

router.get('/logout', (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        res.json({message:'Successfully Logged out'})
    })
})

router.post('/:userId/uploadResume',upload.single('file'), async (req,res)=>{
    try{
        let url = req.file.path;
        let filename = req.file.filename;
        const user = await User.findById(req.params.userId);
        user.resume = {url,filename};
        await user.save();
        res.json({ url: url, message: 'Resume Uploaded Successfuly', type:'success'});
    } catch(error){
        res.json({ url: null, message: 'Server error occured in resume upload', type:'error'})
    }
})

router.post('/:userId/removeResume', async (req,res)=>{
    try{
        await User.findByIdAndUpdate(req.params.userId, { $set: { resume: null } });
        res.json({ message: 'Resume removed Successfuly', type:'success'});
    }catch(error){
        res.json({message: error.message, type:'error'});
    }
})

router.get('/notifications', async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('notifications');
      res.status(200).json(user.notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

router.put('/notifications', async (req, res) => {
    try {
      console.log('req.body', req.body);
      const { notification } = req.body.data;
      console.log(notification);
      let result = await User.updateOne({ _id: req.user._id },{ $pull: { notifications: notification } }
      );
      console.log(result);
  
      res.status(200).json({ message: 'Notification removed successfully', type:'success' });
    } catch (error) {
      res.status(500).json({ message: error.message, type:'error' });
    }
});

export default router;