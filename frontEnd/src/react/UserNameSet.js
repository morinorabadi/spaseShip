import React, { useState } from "react";

export default function SetUserName({ onSetUsername }) {
  const [username, setUsername] = useState("");

  function submit(e){
    e.preventDefault()
    onSetUsername( username )
    setUsername('')
  }

  return (
    <form onSubmit={(e) => submit(e) } className="set-username">
      <p>pick username</p>
      <input 
      type="text" 
      placeholder="enter username"
      onChange={e => setUsername(e.target.value) }
      value={username}
      />
      <button> submit </button>
    </form>
  );
}
