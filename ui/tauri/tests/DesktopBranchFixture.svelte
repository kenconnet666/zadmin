<script lang="ts">
	import { Stack, Text, ZuiProvider } from '@zadmin/zui';

	import type { DesktopPlatform } from '../src/index.js';
	import {
		ClipboardButton,
		DesktopProvider,
		ExternalLink,
		FilePickerButton,
		NotificationButton,
		SystemInfo,
		WindowControls,
		WindowTitleBar
	} from '../src/components/index.js';

	interface Props {
		platform: DesktopPlatform;
	}

	let { platform }: Props = $props();
	let error = $state('');
	let permission = $state('');
	let selection = $state('');
	const onerror = (value: { code: string }) => (error = value.code);
</script>

<ZuiProvider>
	<DesktopProvider {platform}>
		<WindowTitleBar title="Branch fixture" {onerror}>
			<WindowControls {onerror} />
		</WindowTitleBar>
		<Stack gap="small">
			<FilePickerButton
				data-testid="directory"
				mode="directory"
				{onerror}
				onselect={(value) => (selection = Array.isArray(value) ? value.join(',') : (value ?? ''))}
			>
				Choose directory
			</FilePickerButton>
			<FilePickerButton
				data-testid="save"
				mode="save"
				{onerror}
				onselect={(value) => (selection = Array.isArray(value) ? value.join(',') : (value ?? ''))}
			/>
			<ClipboardButton data-testid="write" mode="write" text="written" {onerror}>
				Write clipboard
			</ClipboardButton>
			<ClipboardButton data-testid="clear" mode="clear" {onerror} label="Clear clipboard" />
			<ExternalLink data-testid="blocked" href="https://example.com" {onerror}>Blocked</ExternalLink
			>
			<NotificationButton
				data-testid="permission"
				notification="Permission probe"
				{onerror}
				onpermission={(value) => (permission = value)}
			>
				Permission
			</NotificationButton>
			<SystemInfo {onerror} />
			<Text data-testid="selection">{selection}</Text>
			<Text data-testid="permission-value">{permission}</Text>
			<Text data-testid="error-value">{error}</Text>
		</Stack>
	</DesktopProvider>
</ZuiProvider>
