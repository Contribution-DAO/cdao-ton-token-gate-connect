import React, { useState } from "react"
import { TonProofDemoApi } from "src/TonProofDemoApi";

const urlParams = new URLSearchParams(window.location.search);

export default function VerifyTwitterFollowButton({ groupId, onVerify }: { groupId: string, onVerify: Function }) {
  const [loading, setLoading] = useState(false)
  
  return (
    <div
      className="social-login-btn"
      style={{
        backgroundColor: "#34A2ED",
        width: 200,
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? "none" : "auto",
      }}
      onClick={async () => {
        setLoading(true)

        try {
          const response = await TonProofDemoApi.verifyTwitterFollow(groupId)

          if (response.followed) {
            onVerify(response.approval)
          } else {
            window.alert("You haven't followed yet!")
          }
        } catch (err) {
          console.error(err)
          window.alert("Verify twitter follow failed")
        } finally {
          setLoading(false)
        }
      }}
    >
      {loading ? "Verifying..." : "Verify Follow"}
    </div>
  )
}