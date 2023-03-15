import React, { useState } from "react"
import { TonProofDemoApi } from "src/TonProofDemoApi"

export default function TwitterLoginButton({ twitterName }: { twitterName: string }) {
  const [isLogout, setIsLogout] = useState(!twitterName)

  return (
    <div
      className="social-login-btn"
      title={"Click to " + (isLogout ? "login" : "logout")}
      style={{
        backgroundColor: "#34A2ED",
      }}
      onClick={() => {
        if (isLogout) {
          window.location.href = process.env.REACT_APP_TON_PROOF_HOST + "/social-auth/twitter/login?token=" + TonProofDemoApi.accessToken
        } else {
          if (window.confirm('Are you sure you want to logout of your twitter?')) {
            setIsLogout(true)
          }
        }
      }}
    >
      <img src={"/connect/img/twitter.jpg"} width={24}></img> {isLogout ? "Log in with Twitter" : twitterName}
    </div>
  )
}