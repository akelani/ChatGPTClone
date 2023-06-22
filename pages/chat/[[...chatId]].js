import { getSession } from "@auth0/nextjs-auth0";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChatSidebar } from "components/ChatSidebar";
import { Message } from "components/Message";
import { getCircleWalletBalances } from "lib/circle";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";
import { useRouter } from "next/router";
import { streamReader } from "openai-edge-stream";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import Image from 'next/image';

export default function ChatPage({ chatId, wallet, title, messages = [] }) {
  console.log("props: ", title, messages);
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [fullMessage, setFullMessage] = useState("");
  const [originalChatId, setOriginalChatId] = useState(chatId);
  // const [balance, setBalance] = useState(0);
  const [userWallet, setUserWallet] = useState({ balance: { currency: "USD", amount: 0 }, depositAddresses: [] });
  const router = useRouter();

  const routeHasChanged = chatId !== originalChatId;
  console.log(wallet)
  useEffect(() => {
    setUserWallet({
      balance: {
        currency: wallet.balances[0]?.currency || "",
        amount: wallet.balances[0]?.amount || 0
      },
      depositAddresses: wallet.depositAddresses || []
    });
  }, [wallet])

  // when our route changes
  useEffect(() => {
    setNewChatMessages([]);
    setNewChatId(null);
  }, [chatId]);

  // save the newly streamed message to new chat messages
  useEffect(() => {
    if (!routeHasChanged && !generatingResponse && fullMessage) {
      setNewChatMessages((prev) => [
        ...prev,
        {
          _id: uuid(),
          role: "assistant",
          content: fullMessage,
        },
      ]);
      setFullMessage("");
    }
  }, [generatingResponse, fullMessage, routeHasChanged]);

  // if we've created a new chat
  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userWallet.balance.amount <= 0) {
      console.log("Err");
      alert("No USDC. Please reload wallet.");
      return;
    }

    // Transfer 0.01 USDC for each message sent
    const walletId = wallet.walletId;
    const transferRes = await fetch(`/api/wallet/transfer`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sourceWalletId: walletId
      }),
    });
    if (!transferRes) {
      return;
    }

    const newAmount = userWallet.balance.amount - 0.01;
    const newBalance = { ...userWallet.balance, amount: newAmount }
    console.log("new Amount" + newAmount);
    console.log(newBalance);
    setUserWallet({
      ...userWallet,
      balance: newBalance,
    })
    //console.log("Amount" + userWallet.balance.amount);

    setGeneratingResponse(true);
    setOriginalChatId(chatId);
    setNewChatMessages((prev) => {
      const newChatMessages = [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newChatMessages;
    });
    setMessageText("");

    //console.log("NEW CHAT: ", json);
    const response = await fetch(`/api/chat/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ chatId, message: messageText }),
    });
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    let content = "";
    await streamReader(reader, (message) => {
      console.log("MESSAGE: ", message);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((s) => `${s}${message.content}`);
        content = content + message.content;
      }
    });

    setFullMessage(content);
    setIncomingMessage("");
    setGeneratingResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];

  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} wallet={userWallet} />
        <div className="flex flex-col overflow-hidden bg-gray-700">
          <div className="flex flex-1 flex-col-reverse overflow-scroll text-white">
            {!allMessages.length && !incomingMessage && (
              <div className="m-auto flex items-center justify-center text-center">
                <div>
                  {/* <FontAwesomeIcon
                    icon={faRobot}
                    className="text-6xl text-emerald-200"
                  /> */}
                  <div className="flex justify-center items-center">
                    <Image
                      src="/Circle_USDC_Logo.png"
                      width={100}
                      height={100}
                      alt="Picture of the author"
                    /></div>
                  <h1 className="mt-2 text-4xl font-bold text-white/50">
                    Ask me a question!
                  </h1>
                </div>
              </div>
            )}
            {!!allMessages.length && (
              <div className="mb-auto">
                {allMessages.map((message) => (
                  <Message
                    key={message._id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {!!incomingMessage && !routeHasChanged && (
                  <Message role="assistant" content={incomingMessage} />
                )}
                {!!incomingMessage && !!routeHasChanged && (
                  <Message
                    role="notice"
                    content="Only one message at a time. Please allow any other responses to complete before sending another message"
                  />
                )}
              </div>
            )}
          </div>
          <footer className="bg-gray-800 p-10">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={generatingResponse ? "" : "Send a message..."}
                  className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
                />
                <button type="submit" className="btn">
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  console.log("Logged in!");
  const chatId = ctx.params?.chatId?.[0] || null;
  const { user } = await getSession(ctx.req, ctx.res);

  const balances = await getCircleWalletBalances(user.wallets[0].walletId);
  user.wallets[0].balances = balances;

  if (chatId) {
    let objectId;

    try {
      objectId = new ObjectId(chatId);
    } catch (e) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }

    const client = await clientPromise;
    const db = client.db("CircleGPT");

    const chat = await db.collection("chats").findOne({
      userId: user.sub,
      _id: objectId,
    });

    if (!chat) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }

    return {
      props: {
        chatId,
        wallet: user.wallets[0],
        title: chat.title,
        messages: chat.messages.map((message) => ({
          ...message,
          _id: uuid(),
        })),
      },
    };
  }

  return {
    props: {
      wallet: user?.wallets[0] || null,
    },
  };
};
