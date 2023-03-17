import React, { useState } from "react"
import { TonProofDemoApi } from "src/TonProofDemoApi"

export default function TelegramLoggedInButton({ telegramUsername, onLogout }: { telegramUsername: string, onLogout: Function }) {
  return (
    <div
      className="social-login-btn"
      title={"Click to logout"}
      style={{
        backgroundColor: "#34A2ED",
      }}
      onClick={() => {
        if (window.confirm('Are you sure you want to logout of your telegram?')) {
          onLogout()
        }
      }}
    >
      <img src={"/connect/img/telegram.png"} width={24}></img> {telegramUsername}
    </div>
  )
}