// import { Stripe, loadStripe } from '@stripe/stripe-js';
// import getStripe from '@utils/get-stripe';
import Stripe from "stripe";
import { loadStripeOnramp } from "@stripe/crypto";

export const POST = async (request) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const OnrampSessionResource = Stripe.StripeResource.extend({
        create: Stripe.StripeResource.method({
            method: 'POST',
            path: 'crypto/onramp_sessions',
        }),
    });

    //console.log(OnrampSessionResource);

    const { transaction_details } = await request.json();

    try {
        const onrampSession = await new OnrampSessionResource(stripe).create({
            transaction_details: {
                destination_currency: transaction_details["destination_currency"],
                destination_exchange_amount: transaction_details["destination_exchange_amount"],
                destination_network: transaction_details["destination_network"],
                wallet_addresses: transaction_details["wallet_addresses"],
            },
            //customer_ip_address: "0.0.0.0", //request.socket.remoteAddress,
        })
        //console.log(onrampSession);
        //console.log("api"+JSON.stringify(onrampSession.client_secret));

        return new Response(JSON.stringify(onrampSession.client_secret), { status: 201 });
    } catch (error) {
        console.log(error);
        return new Response("Failed to create Stripe onramp session", { status: 500 });
    }



}