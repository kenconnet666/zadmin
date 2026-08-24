export type ButtonSize = 'large' | 'medium' | 'small';
export type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';

export interface ButtonDesignProps {
	disabled?: boolean;
	loading?: boolean;
	size?: ButtonSize;
	variant?: ButtonVariant;
}
