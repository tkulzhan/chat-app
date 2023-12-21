import { useEffect, useState } from "react";
import ChatList from "../components/ChatList";

export default function Home() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4321/chats")
      .then((data) => data.json())
      .then((data) => {
        console.log(data);
        setChats(data);
      });
  }, []);

  return (
    <ChatList chats={chats} />
  )
}
