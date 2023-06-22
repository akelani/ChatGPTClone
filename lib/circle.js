import { Circle, CircleEnvironments, SubscriptionRequest } from "@circle-fin/circle-sdk";
import { v4 } from "uuid";

const circle = new Circle(
    process.env.CIRCLE_API_KEY,
    CircleEnvironments.sandbox      // API base url
);

const masterWalletId = process.env.CIRCLE_MASTER_WALLET_ID;

export const walletToWalletTransfer = async (sourceWalletId, destinationWalletId, amount) => {
    // console.log("Charging Wallet: ");
    // console.log(destinationWalletId);
    // console.log(amount);

    try {
        const res = await circle.transfers.createTransfer({
            idempotencyKey: v4(),
            source: {
                type: "wallet",
                id: sourceWalletId,
            },
            destination: {
                type: "wallet",
                id: destinationWalletId,
            },
            amount: {
                currency: "USD",
                amount: amount,
            }
        });
        console.log(res.data.data);
        return res.data.data;
    } catch (error) {
        console.log(error);
    }





    // const url = process.env.CIRCLE_API_URI +'transfers';
    // const key = v4();
    // console.log(key);
    // const options = {
    //     method: 'POST',
    //     headers: {
    //         accept: 'application/json',
    //         'content-type': 'application/json',
    //         authorization: 'Bearer ' + process.env.CIRCLE_API_KEY
    //     },
    //     body: JSON.stringify({
    //         idempotencyKey: v4(),
    //         source: { type: 'wallet', id: sourceWalletId },
    //         amount: { currency: 'USD', amount: amount },
    //         destination: { type: 'wallet', id: process.env.CIRCLE_MASTER_WALLET_ID },
    //     })
    // };

    // console.log(options);

    // fetch(url, options)
    //     .then(res => res.json())
    //     .then(json => console.log(json))
    //     .catch(err => console.error('error:' + err));


}

export const createNewCircleWallet = async () => {
    const res = await circle.wallets.createWallet({
        idempotencyKey: v4(),
        description: "User Wallet",
    });

    return res.data.data;
}

export const createDefaultCircleWalletAddress = async (id) => {
    const res = await circle.wallets.generateAddress(id, {
        idempotencyKey: v4(),
        currency: "USD",
        "chain": "SOL",
    })

    return res.data.data;
}

export const getCircleWalletBalances = async (id) => {
    const res = await circle.wallets.getWallet(id)
    return res.data.data.balances;
}