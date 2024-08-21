import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    }
}, {timestamps: true})


/*
let channel names : CAC, HCC, FCC
USer : a,b,c,d,e

Documents :
ch = CAC sub =a
ch = CAC sub =b
ch = CAC sub =c

ch = HCC sub =c
ch = FCC sub =c

To find how many subscriber is there for particular channel let CAC - > then we only match those documents having 
channel = is CAC named and count those.

To find how many You subscribed to channel : then only match those documents having 
subscriber = your used id or channer name = C, count channel list
*/

export const Subscription = mongoose.model("Subscription", subscriptionSchema);