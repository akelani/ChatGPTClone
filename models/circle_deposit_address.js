import { Schema, model, models } from 'mongoose';

const CircleDepositAddressSchema = new Schema({
  wallet: {
    type: Schema.Types.ObjectId,
    ref: 'CircleWallet',
  },
  address: {
    type: String,
    unique: [true, 'Address already exists!'],
    required: [true, 'Address is required!'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required!'],
  },
  chain: {
    type: String,
    required: [true, 'Chain is required!'],
  },
});

const CircleDepositAddress = models.CircleDepositAddress || model("CircleDepositAddress", CircleDepositAddressSchema);

export default CircleDepositAddress;