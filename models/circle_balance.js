import { Schema, model, models } from 'mongoose';

const CircleBalanceSchema = new Schema({
  wallet: {
    type: Schema.Types.ObjectId,
    ref: 'CircleWallet',
  },
  amounnt: {
    type: Number,
  },
  currency: {
    type: Strig,
  },
});

const CircleBalance = models.CircleBalance || model("CircleBalance", CircleBalanceSchema);

export default CircleBalance;