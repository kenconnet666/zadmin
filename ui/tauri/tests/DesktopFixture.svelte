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
		WindowFrame
	} from '../src/components/index.js';

	interface Props {
		platform: DesktopPlatform;
	}

	let { platform }: Props = $props();
	let clipboard = $state('');
	let notification = $state('idle');
	let selected = $state('');
</script>

<ZuiProvider>
	<DesktopProvider {platform}>
		<WindowFrame title="Desktop fixture">
			<Stack gap="small">
				<SystemInfo title="Runtime" />
				<FilePickerButton
					data-testid="file-picker"
					onselect={(value) => (selected = Array.isArray(value) ? value.join(',') : (value ?? ''))}
				/>
				<ClipboardButton
					data-testid="clipboard"
					mode="read"
					label="Read clipboard"
					onread={(value) => (clipboard = value)}
				/>
				<ExternalLink data-testid="external" href="https://v2.tauri.app/plugin/">
					Tauri plugins
				</ExternalLink>
				<NotificationButton
					data-testid="notification"
					notification="Desktop ready"
					onsuccess={() => (notification = 'sent')}
				/>
				<Text data-testid="selected">{selected}</Text>
				<Text data-testid="clipboard-value">{clipboard}</Text>
				<Text data-testid="notification-value">{notification}</Text>
			</Stack>
		</WindowFrame>
	</DesktopProvider>
</ZuiProvider>
