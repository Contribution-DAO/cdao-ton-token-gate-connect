import React from "react"

const urlParams = new URLSearchParams(window.location.search);

export default function ContinueButton() {
  const groupId = urlParams.get("redirect_group_id")
  
  return (
    <a href={groupId ? "/connect?group_id=" + groupId : "/"} style={{
      textDecoration: "none",
      color: "black",
    }}>
      <div
        className="social-login-btn"
        style={{
          backgroundColor: "white",
          width: 200,
        }}
      >
        Continue
      </div>
    </a>
  )
}