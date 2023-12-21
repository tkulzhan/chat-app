import { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onUsernameChange = (evt) => {
    setUsername(evt.target.value);
  };

  const onPasswordChange = (evt) => {
    setPassword(evt.target.value);
  };

  return (
    <div>
      <input
        name="username"
        type="text"
        value={username}
        onChange={onUsernameChange}
      ></input>
      <input
        name="password"
        type="password"
        value={password}
        onChange={onPasswordChange}
      ></input>
      <button>Register</button>
    </div>
  );
}
