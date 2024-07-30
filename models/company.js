import mongoose from "mongoose";
const Schema = mongoose.Schema;

const companySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    website: {
        type: String,
        required: false,
    }, 
    industry: {
        type: String,
        required: true
    },
    jobs: [{
        type: Schema.Types.ObjectId,
        ref: "Job"
    }]
});

const Company = mongoose.model('Company', companySchema);

export default Company;