<script lang="ts">
	import { ZStack, ZText, ZProvider } from '@zadmin/zui';

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

<ZProvider>
	<DesktopProvider {platform}>
		<WindowFrame title="Desktop fixture">
			<ZStack gap="small">
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
				<ZText data-testid="selected">{selected}</ZText>
				<ZText data-testid="clipboard-value">{clipboard}</ZText>
				<ZText data-testid="notification-value">{notification}</ZText>
			</ZStack>
		</WindowFrame>
	</DesktopProvider>
</ZProvider>
