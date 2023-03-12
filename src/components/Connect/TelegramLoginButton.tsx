// @flow
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

interface TelegramLoginButtonProps {
	botName: string;
	className?: string;
	dataOnauth?: (user: any) => any;
	buttonSize?: 'large' | 'medium' | 'small';
	cornerRadius?: number;
	requestAccess?: string;
	usePic?: boolean;
	lang?: string;
	widgetVersion?: number;
	dataAuthUrl?: string;
	children?: ReactNode;
}

declare global {
	interface Window {
		TelegramLoginWidget: any;
	}
}

class TelegramLoginButton extends React.Component<TelegramLoginButtonProps> {
  instance: React.RefObject<any>

	constructor(props: TelegramLoginButtonProps) {
		super(props);
		this.instance = React.createRef<any>();
	}

	componentDidMount() {
		const {
			botName,
			buttonSize = 'large',
			cornerRadius,
			requestAccess = 'write',
			usePic = true,
			dataOnauth = () => undefined,
			dataAuthUrl,
			lang = 'en',
			widgetVersion = 9,
		} = this.props;

		window.TelegramLoginWidget = {
			dataOnauth: (user: any) => dataOnauth(user),
		};

		const script = document.createElement('script');
		script.src = 'https://telegram.org/js/telegram-widget.js?' + widgetVersion;
		script.setAttribute('data-telegram-login', botName);
		script.setAttribute('data-size', buttonSize);
		if (cornerRadius !== undefined) {
			script.setAttribute('data-radius', cornerRadius.toString());
		}
		script.setAttribute('data-request-access', requestAccess);
		script.setAttribute('data-userpic', usePic ? 'true' : 'false');
		script.setAttribute('data-lang', lang);
		if (dataAuthUrl !== undefined) {
			script.setAttribute('data-auth-url', dataAuthUrl);
		} else {
			script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
		}
		script.async = true;
		this.instance.current.appendChild(script);
	}

	render() {
		return (
			<div
				className={this.props.className}
				ref={this.instance}
			>
				{this.props.children}
			</div>
		);
	}
}

export default TelegramLoginButton;
