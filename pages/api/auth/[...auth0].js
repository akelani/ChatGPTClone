import { handleAuth, handleLogin, handleCallback } from "@auth0/nextjs-auth0";
// import clientPromise from "lib/mongodb";
// import { ObjectId } from "mongodb";
import { createDefaultCircleWalletAddress, createNewCircleWallet, getCircleWalletBalances, walletToWalletTransfer } from 'lib/circle';
import CircleWallet from "models/circle_wallet";
import CircleDepositAddress from "models/circle_deposit_address";
import { connectToDB } from "lib/database";

const afterCallback = async (req, res, session, state) => {
  // const client = await clientPromise;
  // const db = client.db("CircleGPT");

  try {
    await connectToDB();

    // check if user has a wallet
    const walletExists = await CircleWallet.findOne({ owner: session.user.sub.toString() });

    if (!walletExists) {
      const wallet = await createNewCircleWallet();

      await CircleWallet.create({
        owner: session.user.sub.toString(),
        walletId: parseInt(wallet.walletId),
        entityId: wallet.entityId,
        type: wallet.type,
        description: wallet.description,
      }).then(async (newWallet) => {
        const address = await createDefaultCircleWalletAddress(newWallet.walletId);

        await CircleDepositAddress.create({
          wallet: newWallet._id.toString(),
          address: address.address,
          currency: address.currency,
          chain: address.chain,
        }).then(async (address) => {
          newWallet.depositAddresses = [address];
          await newWallet.save();
        });
      });
    }

    const sessionWallets = await CircleWallet.find({ owner: session.user.sub.toString() }).populate("depositAddresses");
    session.user.wallets = sessionWallets;
    console.log("Session: ");
    console.log(session);


    /*const wallet = await db.collection("wallets").findOne({
      owner: session.user.sub,
    });
    console.log("Wallet Exists?: ")
    console.log(wallet);

    // if not, create one
    if (!wallet) {
      const wallet = await createNewCircleWallet();
      console.log("Created Wallet?: ")
      console.log(wallet);
      const newWallet = await db.collection("wallets").insertOne({
        owner: session.user.sub.toString(),
        walletId: parseInt(wallet.walletId),
        entityId: wallet.entityId,
        type: wallet.type,
        description: wallet.description,
      }).then(async (newWallet) => {
        console.log(newWallet);

        const address = await createDefaultCircleWalletAddress(wallet.walletId);
        console.log("Created Address?: ")
        console.log(address);
        await db.collection("addresses").insertOne({
          wallet: newWallet.insertedId.toString(),
          address: address.address,
          currency: address.currency,
          chain: address.chain,
        }).then(async (newAddress) => {
          console.log(newAddress);

          const addresses = await db.collection("wallets").findOneAndUpdate(
            {
              walletId: parseInt(wallet.walletId),
            },
            {
              $set: {
                addresses: [address]
              },
            },
            {
              upsert: true,
              returnDocument: "after",
            }
          );

          console.log(addresses);

          // newWallet.depositAddresses = [newAddress];
          // await newWallet.save();
        });
      });

    }*/
  } catch (error) {
    console.log(error);
  }


  return session;
};

export default handleAuth({
  async callback(req, res) {
    console.log("In After Callback!");
    try {
      await handleCallback(req, res, { afterCallback });
    } catch (error) {
      res.status(error.status || 500).end();
    }
  },
  async signup(req, res) {
    await handleLogin(req, res, {
      authorizationParams: {
        screen_hint: "signup"
      },
      returnTo: '/chat'
    });
  },
  async login(req, res) {
    await handleLogin(req, res, {
      authorizationParams: {
        screen_hint: "login"
      },
      returnTo: '/chat'
    });
  },
  onError(req, res, error) {
    console.log(error);
    res.status(error.status || 400).end();
  }
});