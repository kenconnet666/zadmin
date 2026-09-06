<script lang="ts">
	import ZSimpleGrid from '../src/components/layout/ZSimpleGrid.svelte';

	const responsiveColumns = { base: 1, medium: 3 } as const;
</script>

<ZSimpleGrid columnGap={12} data-testid="simple-grid-columns" gap="small" rowGap={20} columns={3}>
	<div>One</div>
	<div>Two</div>
	<div>Three</div>
</ZSimpleGrid>

<div data-testid="simple-grid-adaptive-owner" style="width: 400px">
	<ZSimpleGrid data-testid="simple-grid-adaptive" gap={8} minItemWidth="12rem">
		<div>One</div>
		<div>Two</div>
		<div>Three</div>
	</ZSimpleGrid>
</div>

<ZSimpleGrid columns={responsiveColumns} data-testid="simple-grid-responsive">
	<div>One</div>
	<div>Two</div>
	<div>Three</div>
</ZSimpleGrid>

<div dir="rtl" data-testid="simple-grid-rtl-owner">
	<ZSimpleGrid columns={2} data-testid="simple-grid-rtl">
		<div>يمين</div>
		<div>يسار</div>
	</ZSimpleGrid>
</div>
