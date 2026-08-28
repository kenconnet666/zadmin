export type MiniStylePrimitive = string | number | null | undefined;
export type MiniStyleObject = Readonly<Record<string, MiniStylePrimitive>>;
export type MiniStyle = string | MiniStyleObject | null | undefined;

export interface MiniStyleProgram {
	readonly className: `m-${string}`;
	readonly style: string | undefined;
	readonly wxss: string;
}
