import { Spin } from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { AppTitle } from 'src/components/AppTitle/AppTitle';
import { AuthButton } from 'src/components/AuthButton/AuthButton';
import { TxForm } from 'src/components/TxForm/TxForm';
import { connector } from 'src/connector';
import './app.scss';
import ContinueButton from './components/Connect/ContinueButton';
import JoinButton from './components/Connect/JoinButton';
import MintButton from './components/Connect/MintButton';
import TelegramLoggedInButton from './components/Connect/TelegramLoggedInButton';
import TelegramLoginButton from './components/Connect/TelegramLoginButton';
import TwitterLoginButton from './components/Connect/TwitterLoginButton';
import VerifyTwitterFollowButton from './components/Connect/VerifyTwitterFollowButton';
import { TonProofDemo } from './components/TonProofDemo/TonProofDemo';
import { useSlicedAddress } from './hooks/useSlicedAddress';
import { useTonWallet } from './hooks/useTonWallet';
import { TonProofDemoApi } from './TonProofDemoApi';

const urlParams = new URLSearchParams(window.location.search);

function App() {
	const [loading, setLoading] = useState(true);
	const [wallet, setWallet] = useState<any>(null);
	const [hasTelegramAuth, setHasTelegramAuth] = useState<boolean>(false);

	// Telegram Group
	const [group, setGroup] = useState<any>(null);
	const [groupLoading, setGroupLoading] = useState(true);
	const [approval, setApproval] = useState<any>(null);

	const groupId = urlParams.get('group_id');

	useEffect(() => {
		connector.restoreConnection();
	}, []);

	const refreshData = useCallback(() => {
		setTimeout(() => {
			// console.log("Rerun")
			TonProofDemoApi.getMyWallet()
				.then((wallet) => {
					setWallet(wallet);
				})
				.catch((err) => {
					console.error(err);
					setWallet(null);
				})
				.finally(() => {
					setLoading(false);
				});

			if (groupId) {
				TonProofDemoApi.getTelegramGroup(groupId)
					.then((group) => {
						setGroup(group);
					})
					.catch((err) => {
						console.error(err);
						setGroup(null);
					})
					.finally(() => {
						setGroupLoading(false);
					});
			}
		}, 200);
	}, [wallet]);

	useEffect(() => {
		refreshData();
	}, []);

	useEffect(() => {
		if (!wallet) {
			setHasTelegramAuth(false);
			return;
		}

		setHasTelegramAuth(Boolean(wallet?.telegramUserId));
	}, [wallet]);

	if (loading || (groupId && groupLoading)) {
		return (
			<div className="app">
				<div className="center-of-page">
					<Spin size="large"></Spin>
				</div>
			</div>
		);
	}

	if (groupId) {
		console.log(group)

		return (
			<div className="app">
				<div className="center-of-page">
					<div style={{ fontSize: 24, marginBottom: 18 }}>Join {group.name}</div>

					<div>
						<img src={group.avatar || "/connect/img/telegram-whitebg.png"} style={{ borderRadius: "50%", width: 120, marginTop: 16, marginBottom: 24 }} />
					</div>

					<div style={{ fontSize: "1.1rem" }}>
						Follow{' '}
						<a
							href={'https://twitter.com/' + group.twitterUsername}
							target="popup"
							onClick={() =>
								window.open('https://twitter.com/' + group.twitterUsername, 'popup', 'width=600,height=600')
							}
						>
							@{group.twitterUsername}
						</a>
					</div>

					<div style={{ marginTop: 16 }}>
						{group.isMinted ? (
							<div>
								<div style={{ marginBottom: 12 }}>
									<JoinButton invitationLink={group.invitationLink} />
								</div>

								<div>
									<ContinueButton />
								</div>
							</div>
						) : (
							<div>
								{approval ? (
									<div>
										<MintButton approvalId={approval.id} onMint={refreshData} />
									</div>
								) : (
									<div>
										<VerifyTwitterFollowButton groupId={groupId} onVerify={(approval: any) => {
											setApproval(approval)
											refreshData()
										}} />
									</div>
								)}
							</div>
						)}
					</div>

					<div>

					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="app">
			<div className="center-of-page">
				<div style={{ fontSize: 24, marginBottom: 18 }}>
					{groupId ? 'Join ' + (groupLoading ? '...' : group.name) : 'Connect your account'}
				</div>

				<div>
					<div style={{ marginBottom: 16 }}>
						<AuthButton onWalletChange={(wallet: any) => refreshData()} />
					</div>

					{wallet && (
						<>
							{hasTelegramAuth ? (
								<div style={{ marginBottom: 12, textAlign: 'center' }}>
									<TelegramLoggedInButton
										telegramUsername={wallet?.telegramUsername}
										onLogout={() => setHasTelegramAuth(false)}
									></TelegramLoggedInButton>
								</div>
							) : (
								<div style={{ marginBottom: 12, textAlign: 'center' }}>
									<TelegramLoginButton
										botName="TonSBTGateCDAOBot"
										dataOnauth={async (data) => {
											console.log('Telegram Data', data);

											const response = await axios.get(process.env.REACT_APP_TON_PROOF_HOST + '/telegram/callback', {
												params: data,
												headers: {
													Authorization:
														'Bearer ' + window.localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_KEY!),
												},
											});

											refreshData();
										}}
									/>
								</div>
							)}

							<div style={{ marginBottom: 16 }}>
								<TwitterLoginButton twitterName={wallet?.twitterName}></TwitterLoginButton>
							</div>
						</>
					)}
				</div>

				{wallet && wallet.walletAddress && wallet.telegramUserId && wallet.twitterUsername && (
					<>
						<hr style={{ width: 280 }} />

						<div style={{ marginTop: 12 }}>
							<ContinueButton />
						</div>
					</>
				)}
			</div>

			<header>{/* <AppTitle /> */}</header>
			<main>
				{/* <TxForm /> */}
				{/* <TonProofDemo /> */}
			</main>
		</div>
	);
}

export default App;
