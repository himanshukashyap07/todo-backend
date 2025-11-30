import mongoose,{Document,Schema} from "mongoose";


export interface ITODO extends Document{
    content:string;
    isCompleted:boolean;
    owner:mongoose.Types.ObjectId;
    createdAt:Date;
    updatedAt:Date;
}

const TodoSchema:Schema = new Schema({
    content:{
        type:String,
        required:[true,"Content is required"],
        trim:true,
        minlength:[1,"Content must be at least 1 character long"],
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
},{timestamps:true});
const Todo = mongoose.model<ITODO>("Todo",TodoSchema);
export default Todo;