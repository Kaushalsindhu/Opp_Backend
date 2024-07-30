import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose'

const userSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true,
        enum: ['employer', 'jobseeker'],
    },
    postedJobs:[{
        type: Schema.Types.ObjectId,
        ref: "Job"
    }],
    company:{
        type: Schema.Types.ObjectId,
        ref: "Company"
    },
    resume:{
        url: String,
        filename: String,
    },
    savedJobs:[{
        type: Schema.Types.ObjectId,
        ref: "Job"
    }],
    notifications:[{
        type: String,
    }]
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);
export default User;