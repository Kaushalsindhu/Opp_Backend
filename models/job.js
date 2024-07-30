import mongoose from "mongoose";
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    company: {
      type: Schema.Types.ObjectId, 
      ref: "Company"
    },
    location: {
      type: String,
      required: true
    },
    salary: {
      type: String,
      required: true
    },
    jobType: {
      type: String,
      required: true,
      enum: ['full-time', 'part-time', 'internship', 'contract']
    },
    experience: {
      type: String,
      required: true
    },
    requirements: {
      type: String,
      required: true
    },
    employer:{
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    applicants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

const Job = mongoose.model("Job",jobSchema);
export default Job;