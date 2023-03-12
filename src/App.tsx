import { Spin } from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { AppTitle } from 'src/components/AppTitle/AppTitle';
import { AuthButton } from 'src/components/AuthButton/AuthButton';
import { TxForm } from 'src/components/TxForm/TxForm';
import { connector } from 'src/connector';
import './app.scss';
import TelegramLoggedInButton from './components/Connect/TelegramLoggedInButton';
import TelegramLoginButton from './components/Connect/TelegramLoginButton';
import TwitterLoginButton from './components/Connect/TwitterLoginButton';
import { TonProofDemo } from './components/TonProofDemo/TonProofDemo';
import { useSlicedAddress } from './hooks/useSlicedAddress';
import { useTonWallet } from './hooks/useTonWallet';
import { TonProofDemoApi } from './TonProofDemoApi';

function App() {
	const [loading, setLoading] = useState(true);
	const [wallet, setWallet] = useState<any>(null);
	const [hasTelegramAuth, setHasTelegramAuth] = useState<boolean>(false);

	// Telegram Group
	const [groupLoading, setGroupLoading] = useState(true);

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
		}, 200);
	}, [wallet]);

	useEffect(() => {
		refreshData();
	}, []);

	useEffect(() => {
		if (!wallet) {
			setHasTelegramAuth(false)
			return;
		}

		setHasTelegramAuth(Boolean(wallet?.telegramUserId))
	}, [wallet])

	if (loading) {
		return (
			<div className="app">
				<div className="center-of-page">
					<Spin size="large"></Spin>
				</div>
			</div>
		);
	}

	return (
		<div className="app">
			<div className="center-of-page">
				<div style={{ fontSize: 24, marginBottom: 18 }}>Connect your account</div>

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
										botName="TonSBTGateBot"
										dataOnauth={async (data) => {
											console.log('Telegram Data', data);

											const response = await axios.get(process.env.REACT_APP_TON_PROOF_HOST + '/telegram/callback', {
												params: data,
												headers: {
													Authorization:
														'Bearer ' + window.localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_KEY!),
												},
											});

											refreshData()
										}}
									/>
								</div>
							)}

							<div style={{ marginBottom: 16 }}>
								<TwitterLoginButton twitterUsername={wallet?.twitterUsername}></TwitterLoginButton>
							</div>
						</>
					)}
				</div>
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
