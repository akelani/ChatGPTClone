import { walletToWalletTransfer } from "lib/circle";

export default async function handler(req, res) {
    //console.log(req.body);
    const { sourceWalletId, destinationWalletId = process.env.CIRCLE_MASTER_WALLET_ID, amount = 0.01 } = await req.body;

    // console.log(destinationWalletId);
    // console.log(amount);

    try {
        const transferRes = await walletToWalletTransfer(sourceWalletId, destinationWalletId, amount);
        //console.log(transferRes);
        res.status(200).json(transferRes);
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ message: "An error occurred when transferring USDC" });
    }
}