"use client";

import { useState, useEffect } from 'react';

import { CryptoElements, OnrampElement } from './StripeCryptoElements';
import { loadStripeOnramp } from '@stripe/crypto';

const stripeOnrampPromise = loadStripeOnramp("pk_test_51ImUWoDG1tfuocbIv2WkCLHsk9WEfeyz41RLPc857Z9Q8K79eyp7wKDxjGOBN6hK1V8jjMujO4O9wadcNIi9D0AP00NcePcKVw")
//const stripeOnrampPromise = loadStripeOnramp(process.env.STRIPE_PUBLISHABLE_KEY);

const StripeOnramp = ({wallet}) => {

    const [clientSecret, setClientSecret] = useState("");
    const [message, setMessage] = useState("");

    
    useEffect(() => {
        // console.log("Fetch...");
        // console.log(wallet.depositAddresses[0].address);

        const fetchOnrampSession = async () => {
            try {
                const response = await fetch(
                    "/api/stripe-crypto-onramp/new",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            transaction_details: {
                                destination_currency: "usdc",
                                destination_exchange_amount: "10.00",
                                destination_network: "solana",
                                wallet_addresses: {
                                    solana: wallet.depositAddresses[0].address,
                                }
                            }
                        }),
                    })
                if (response.ok) {
                    const data = await response.json();
                    //console.log("onramp" + data);
                    setClientSecret(data);
                }
            } catch (error) {
                console.log(error)
            }

        };

        fetchOnrampSession();
    }, []);

    // const onChange = async ({ session }) => {
    //     setMessage(`OnrampSession is now in ${session.status} state.`);
    // };

    return (
        <CryptoElements stripeOnramp={stripeOnrampPromise}>
            {clientSecret && (
                <OnrampElement
                    id="onramp-element"
                    clientSecret={clientSecret}
                    appearance={{ theme: "dark" }}
                    className="content-center"
                    //onChange={onChange}
                />
            )}
        </CryptoElements>
    )
}

export default StripeOnramp