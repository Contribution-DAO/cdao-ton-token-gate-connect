import React from "react"

const urlParams = new URLSearchParams(window.location.search);

export default function JoinButton({ invitationLink }: { invitationLink: string }) {
  const groupId = urlParams.get("redirect_group_id")
  
  return (
    <a href={invitationLink} target="_blank" rel="noreferrer" style={{
      textDecoration: "none",
      color: "white",
    }}>
      <div
        className="social-login-btn"
        style={{
          backgroundColor: "#34A2ED",
          width: 200,
        }}
      >
        Join
      </div>
    </a>
  )
}