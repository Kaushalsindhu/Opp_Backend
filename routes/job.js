import express from 'express'
import Job from '../models/job.js';
import Company from '../models/company.js';
import User from '../models/user.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const jobs = await Job.find().populate('company');
      console.log("hello");
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}); 

router.get('/featured', async (req, res) => {
    try {
      const featuredUser = await User.find({username:'Kaushal Sindhu'}).populate('postedJobs');
      res.json(featuredUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

router.post('/new', async (req, res) => {
    try{
        let jobData = {...req.body, employer: req.user._id, company: req.user.company};
        let newJob = new Job(jobData);
        if(!newJob.company){
            res.json({message: 'First set the company profile in dashboard', type: 'error'});
            return ;
        }
        await newJob.save();
        let currUser = await User.findById(req.user._id);
        currUser.postedJobs.push(newJob);
        await currUser.save();
        let company = await Company.findById(req.user.company);
        company.jobs.push(newJob);
        await company.save();
        res.json({ message: 'Job created successfully', type: 'success'});
    } catch (error){
        console.log(error);
        res.status(500).json({ message: 'Error posting job', type: '' });
    }
});

router.get('/posted', async (req,res)=>{
    try{ 
        const employerId = req.user._id;
        const postedJobs = await Job.find({ employer: employerId });
        res.json(postedJobs);
    }catch(error){
        res.status(500).json({ message: 'Error fetching jobs' });
    }
})

router.get('/saved', async(req,res)=>{
    try{
        const user = await User.findById(req.user._id).populate({path: 'savedJobs',populate: { path: 'company' } }).populate('company')
        const savedJobs = user.savedJobs;
        res.json(savedJobs);
    }catch(error){
        res.status(500).json({message: 'Error fetching jobs'});
    }
})

router.post('/saved/:jobId', async (req,res)=>{
    try{
        await User.findByIdAndUpdate(req.user._id, { $pull: { savedJobs: req.params.jobId } });
        res.json({message: 'Job removed', type: 'success'})
    }catch(error){
        res.status(500).json({message: 'Error reoving saved job', type:'error'});
    }
})

router.get('/:jobId',async (req,res)=>{
    try{
        let job = await Job.findById(req.params.jobId).populate('company');
        res.json(job);
    }catch(error){
        res.json({message: error.message});
    }
})

router.delete('/:jobId', async (req,res)=>{
    try {
        let {jobId} = req.params;
        let job = await Job.findByIdAndDelete(jobId);
        await User.findByIdAndUpdate(req.user._id, { $pull: { postedJobs: jobId } });
        if (!job) {
          return res.status(404).json({ error: 'Job not found' });
        }
        if (job.employer.toString() !== req.user._id.toString()) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})

router.post('/save/:jobId', async(req,res)=>{
    try{
        if(!req.isAuthenticated()){
            return res.json({ message: 'Login to save a job', type: 'error'});
        }
        let currUser = await User.findById(req.user._id);
        if(!(currUser.category === "jobseeker")){
            return res.json({message: 'Employers are not allowed to save jobs', type: 'error'});
        }
        if (currUser.savedJobs.includes(req.params.jobId)) {
            return res.json({ message: 'Job is already saved', type: 'success' });
        }
        currUser.savedJobs.push(req.params.jobId);
        await currUser.save();
        res.status(200).json({ message: 'Job saved successfully', type: 'success' });
    }catch(error){
        res.status(500).json({ message: error.message, type: 'error' });
    }
})

router.post('/apply/:jobId', async(req,res)=>{
    try {
        const jobId = req.params.jobId;
        if(!req.isAuthenticated()){
            return res.json({ message: 'Login to apply for a job', type: 'error'});
        }
        let userId = req.user._id;
        let currUser = await User.findById(userId);
        if(!(currUser.category === "jobseeker")){
            return res.json({message: 'Employers are not allowed to apply for a job', type: 'error'});
        }
        console.log(currUser);
        if(!currUser.resume || !currUser.resume.url){
            return res.json({message: 'First upload resume in your dashboard', type: 'error'});
        }
    
        const job = await Job.findById(jobId);
        if (!job) {
          return res.json({ message: 'Job not found', type: 'error' });
        }
        if (job.applicants.includes(userId)) {
            return res.json({ message: 'You have already applied to this job', type: 'success' });
        }
        job.applicants.push(userId);
        if (!currUser.savedJobs.includes(req.params.jobId)) {
            currUser.savedJobs.push(jobId);
            await currUser.save();
        }
        await job.save();
        res.status(200).json({ message: 'Successfully applied to the job', type: 'success' });
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'error' });
    }
})

router.get('/:jobId/applicants', async (req, res) => {
    const { jobId } = req.params;
    try {
      const job = await Job.findById(jobId).populate('applicants');
      if (!job) {
        return res.json({ error: 'Job not found' });
      }
      res.json(job.applicants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

router.delete('/:jobId/applicants/:applicantId', async(req,res)=>{
    const {jobId, applicantId} = req.params;
    try{
        const job = await Job.findByIdAndUpdate(jobId,{ $pull: { applicants: applicantId } });
        let popJob = await Job.findById(jobId).populate('company');
        let notification = `Your application for the post of ${popJob.title} at ${popJob.company.name} has been rejected`;
        const applicant = await User.findByIdAndUpdate(applicantId, {$push: {notifications: notification}});
        console.log(applicant);
        res.json({message: 'Applicant removed'})
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

export default router;