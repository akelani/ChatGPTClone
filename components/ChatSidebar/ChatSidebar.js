import {
  faMessage,
  faPlus,
  faRightFromBracket,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import StripeOnramp from "components/StripeOnramp";
import Image from 'next/image';

export const ChatSidebar = ({ chatId, wallet }) => {
  const [chatList, setChatList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // console.log("BOOM");
  console.log(wallet);
  // console.log(walletBalances);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch(`/api/chat/getChatList`, {
        method: "POST",
      });
      const json = await response.json();
      console.log("CHAT LIST: ", json);
      setChatList(json?.chats);
    };
    loadChatList();
  }, [chatId]);

  return (
    <div className="flex flex-col overflow-hidden bg-gray-900 text-white">
      <Link
        href="/chat"
        className="side-menu-item bg-emerald-500 hover:bg-emerald-600"
      >
        <FontAwesomeIcon icon={faPlus} /> New chat
      </Link>
      <div className="flex-1 overflow-auto bg-gray-950">
        {chatList.map((chat) => (
          <Link
            key={chat._id}
            href={`/chat/${chat._id}`}
            className={`side-menu-item ${chatId === chat._id ? "bg-gray-700 hover:bg-gray-700" : ""
              }`}
          >
            <FontAwesomeIcon icon={faMessage} className="text-white/50" />{" "}
            <span
              key={chat._id}
              title={chat.title}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {chat.title}
            </span>
          </Link>
        ))}
      </div>

      <div>
          <div  className="side-menu-item">
            <Image
              src="/Circle_USDC_Logo.png"
              width={30}
              height={30}
              alt="Picture of the author"
            />  Balance: {wallet.balance.amount} {wallet.balance.currency}
          </div>
        
        <>
          {showModal ? (
            <>
              <div
                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
              >
                <div className="relative w-200 my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

                    <div className="relative p-10  ">
                      <StripeOnramp wallet={wallet} />

                    </div>
                    {/*footer*/}
                    <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                      <button
                        className="text-blue-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all"
                        type="button"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          <Link
            href=""
            onClick={() => setShowModal(true)}
            className="side-menu-item bg-blue-500 hover:bg-blue-600"
          >
            <FontAwesomeIcon icon={faPlus} /> Add USDC (Stripe)
          </Link>
          <Link
            href=""
            onClick={() => {}}
            className="side-menu-item bg-blue-500 hover:bg-blue-600"
          >
            <FontAwesomeIcon icon={faPlus} /> Add USDC (Wallet)
          </Link>
        </>
      </div>

      <Link href="/api/auth/logout" className="side-menu-item">
        <FontAwesomeIcon icon={faRightFromBracket} /> Logout
      </Link>
    </div>
  );
};