import type { MiniComponentProps, MiniappEvent } from '../types.ts';

export type MButtonSize = 'large' | 'medium' | 'small';
export type MButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';
export type MButtonOpenType =
	| 'agreePrivacyAuthorization'
	| 'chooseAvatar'
	| 'contact'
	| 'getPhoneNumber'
	| 'getRealtimePhoneNumber'
	| 'getUserInfo'
	| 'launchApp'
	| 'openSetting'
	| 'share';

export interface MButtonProps extends MiniComponentProps {
	readonly appParameter?: string;
	readonly disabled?: boolean;
	readonly formType?: 'reset' | 'submit';
	readonly hoverClass?: string;
	readonly lang?: 'en' | 'zh_CN' | 'zh_TW';
	readonly loading?: boolean;
	readonly name?: string;
	readonly onclick?: (event: MiniappEvent) => void;
	readonly onOpenType?: (event: MiniappEvent) => void;
	readonly openType?: MButtonOpenType;
	readonly sessionFrom?: string;
	readonly showMessageCard?: boolean;
	readonly size?: MButtonSize;
	readonly variant?: MButtonVariant;
}
