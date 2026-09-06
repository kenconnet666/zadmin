<script lang="ts">
	import {
		ZAlert,
		ZBadge,
		ZButton,
		ZCalendar,
		ZProvider,
		ZTag,
		defaultTheme,
		type ZuiTheme
	} from '../src/entrypoints/index.js';
	import { CalendarDate } from '@internationalized/date';
	const selectedDate = new CalendarDate(2026, 9, 5);
	let { theme = defaultTheme }: { theme?: ZuiTheme } = $props();
	const zui = $derived({ theme });
</script>

<ZProvider {theme}>
	<div aria-hidden="true" data-testid="theme-color-markers">
		<span data-testid="marker-text" style={`color: ${theme.color.text}`}></span>
		<span data-testid="marker-info-subtle" style={`background-color: ${zui.theme.color.infoSubtle}`}
		></span>
		<span
			data-testid="marker-danger-subtle"
			style={`background-color: ${zui.theme.color.dangerSubtle}`}
		></span>
		<span
			data-testid="marker-success-subtle"
			style={`background-color: ${zui.theme.color.successSubtle}`}
		></span>
		<span
			data-testid="marker-warning-subtle"
			style={`background-color: ${zui.theme.color.warningSubtle}`}
		></span>
		<span data-testid="marker-info" style={`color: ${zui.theme.color.info}`}></span>
		<span data-testid="marker-danger" style={`color: ${zui.theme.color.danger}`}></span>
		<span data-testid="marker-success" style={`color: ${zui.theme.color.success}`}></span>
		<span data-testid="marker-warning" style={`color: ${zui.theme.color.warning}`}></span>
		<span data-testid="marker-on-primary" style={`color: ${zui.theme.color.onPrimary}`}></span>
		<span data-testid="marker-on-danger" style={`color: ${zui.theme.color.onDanger}`}></span>
		<span
			data-testid="marker-primary-subtle"
			style={`background-color: ${zui.theme.color.primarySubtle}`}
		></span>
	</div>

	<ZTag data-testid="tag-info" tone="info">Info tag</ZTag>
	<ZTag data-testid="tag-danger" tone="danger">Danger tag</ZTag>
	<ZTag data-testid="tag-success" tone="success">Success tag</ZTag>
	<ZTag data-testid="tag-warning" tone="warning">Warning tag</ZTag>

	<ZAlert data-testid="alert-info" title="Info alert" tone="info" />
	<ZAlert data-testid="alert-success" title="Success alert" tone="success" />
	<ZAlert data-testid="alert-warning" title="Warning alert" tone="warning" />
	<ZAlert data-testid="alert-danger" title="Danger alert" tone="danger" />

	<ZButton data-testid="button-primary" variant="solid">Primary</ZButton>
	<ZButton data-testid="button-danger" tone="danger" variant="solid">Danger</ZButton>
	<ZButton data-testid="button-primary-loading" loading variant="solid">Primary loading</ZButton>
	<ZButton data-testid="button-danger-loading" loading tone="danger" variant="solid">
		Danger loading
	</ZButton>
	<ZButton data-testid="button-outline" variant="outline">Outline</ZButton>
	<ZButton data-testid="button-ghost" variant="ghost">Ghost</ZButton>
	<ZBadge data-testid="badge-danger" tone="danger" count={9} />
	<ZCalendar data-testid="calendar" value={selectedDate} focusedValue={selectedDate} />
</ZProvider>
