import type { DesktopPlatform } from './driver.js';

export type AsyncCommand = (...args: never[]) => Promise<unknown>;

export type CommandArgs<TCommand extends AsyncCommand> = Parameters<TCommand>;
export type CommandResult<TCommand extends AsyncCommand> = Awaited<ReturnType<TCommand>>;

export type DesktopPlatformWith<TCommands extends object> = DesktopPlatform & {
	readonly commands: TCommands;
};

export function withDesktopCommands<TCommands extends object>(
	platform: DesktopPlatform,
	commands: TCommands
): DesktopPlatformWith<TCommands> {
	return Object.assign(platform, { commands });
}
