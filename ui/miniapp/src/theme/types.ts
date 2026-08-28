export type MiniappTokenValue = string | number;
export type MiniappTokenGroup = Readonly<Record<string, MiniappTokenValue>>;

export interface MiniappTheme {
	readonly color: {
		readonly border: string;
		readonly canvas: string;
		readonly danger: string;
		readonly primary: string;
		readonly primaryActive: string;
		readonly surface: string;
		readonly text: string;
		readonly textMuted: string;
	};
	readonly fontSize: MiniappTokenGroup;
	readonly fontWeight: MiniappTokenGroup;
	readonly opacity: MiniappTokenGroup;
	readonly radius: MiniappTokenGroup;
	readonly safeArea: {
		readonly bottom: string;
		readonly left: string;
		readonly right: string;
		readonly top: string;
	};
	readonly size: MiniappTokenGroup;
	readonly space: MiniappTokenGroup;
	readonly touch: {
		readonly activeOpacity: number;
		readonly gestureThreshold: string;
		readonly minTarget: string;
	};
	readonly zIndex: MiniappTokenGroup;
}

export type MiniappThemePatch = {
	readonly [TGroup in keyof MiniappTheme]?: Partial<MiniappTheme[TGroup]>;
};
