<script lang="ts">
	import {
		ZAlert,
		ZEmpty,
		ZKbd,
		ZMeter,
		ZProgress,
		ZSeparator,
		ZSkeleton,
		ZToggleButton
	} from '../src/entrypoints/index.js';
	import { ZCode } from '../src/entrypoints/code.js';
</script>

<div data-testid="feedback-display-fixture">
	<ZAlert title="Info" tone="info" data-testid="alert-info">Details</ZAlert>
	<ZAlert title="Danger" tone="danger" data-testid="alert-danger">Details</ZAlert>
	<ZProgress label="Line" value={25} data-testid="progress-line" />
	<ZProgress label="Circle" value={75} view="circle" data-testid="progress-circle" />
	<ZMeter
		label="Critical"
		value={95}
		low={30}
		high={80}
		optimum={20}
		data-testid="meter-critical"
	/>
	<ZMeter label="Optimal" value={20} low={30} high={80} optimum={20} data-testid="meter-optimal" />
	<ZSkeleton shape="circle" width={40} data-testid="skeleton-circle" />
	<ZSkeleton
		shape="rectangle"
		width="120px"
		height="24px"
		animated={false}
		data-testid="skeleton-rectangle"
	/>
	<ZEmpty title="No results" headingLevel={3} data-testid="empty">No matching records.</ZEmpty>
	<ZToggleButton aria-label="Favorite" defaultPressed data-testid="toggle-pressed"
		>Favorite</ZToggleButton
	>
	<ZToggleButton aria-label="Not favorite" data-testid="toggle-idle">Favorite</ZToggleButton>
	<ZSeparator orientation="horizontal" data-testid="separator-horizontal" />
	<ZSeparator orientation="vertical" data-testid="separator-vertical" />
	<ZKbd data-testid="kbd">Ctrl K</ZKbd>
	<ZCode ariaLabel="Snippet" code="const ready = true;" lang="typescript" data-testid="code" />
</div>
