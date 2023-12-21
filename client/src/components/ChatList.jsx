import Chat from "./Chat";

export default function ChatList({ chats }) {
  return (
    <div>
      {chats.map((chat) => {
        return <Chat key={chat._id} chat={chat} />;
      })}
    </div>
  );
}
