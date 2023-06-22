import {
    faMessage,
    faPlus,
    faRightFromBracket,
    faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Wallet = ({ wallet }) => {
    const [wallets, setWallets] = useState([]);

    // useEffect(() => {
    //   const loadChatList = async () => {
    //     const response = await fetch(`/api/chat/getChatList`, {
    //       method: "POST",
    //     });
    //     const json = await response.json();
    //     console.log("CHAT LIST: ", json);
    //     setChatList(json?.chats || []);
    //   };
    //   loadChatList();
    // }, [chatId]);

    // useEffect(() => {
    //   const loadWallets = async () => {
    //     const session = await getSession(ctx.req, ctx.res);
    //     setWallets(session.user.wallets);
    //   }
    //   loadWallets();
    // }, [wallets]);

    return (
        <>
            <Link href="" className="side-menu-item">
                <FontAwesomeIcon icon={faMoneyBill} /> USDC Balance: 
            </Link>
        </>
    );
};