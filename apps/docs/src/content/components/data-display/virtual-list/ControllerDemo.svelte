<script lang="ts">
	import { tick } from 'svelte';
	import {
		ZButton,
		ZInput,
		ZProvider,
		ZStack,
		ZText,
		ZVirtualList,
		type ZVirtualListController
	} from '@zadmin/zui';

	const options = Array.from({ length: 1000 }, (_, index) => ({
		disabled: index === 500,
		id: index,
		label: `环境 ${index + 1}`
	}));
	const optionIds = new Map(
		options.map((option, index) => [option.id, `environment-option-${index + 1}`])
	);
	const mountedOptions = new Map<number, { element: HTMLElement; token: symbol }>();
	let controller = $state<ZVirtualListController<number> | null>(null);
	let activeKey = $state<number>();
	let activeId = $state<string>();
	function mountOption(key: number, element: HTMLElement): () => void {
		const token = Symbol();
		mountedOptions.set(key, { element, token });
		return () => {
			if (mountedOptions.get(key)?.token === token) mountedOptions.delete(key);
		};
	}
	function synchronizeActiveId(): void {
		activeId = activeKey === undefined ? undefined : mountedOptions.get(activeKey)?.element.id;
	}

	async function activate(key: number): Promise<void> {
		activeKey = key;
		controller?.ensureKey(key);
		await tick();
		synchronizeActiveId();
	}

	async function activateSmooth(key: number): Promise<void> {
		activeKey = key;
		controller?.scrollToKey(key, 'center', 'smooth');
		await tick();
		synchronizeActiveId();
	}

	function nextEnabled(start: number, delta: -1 | 1): number {
		let index = start;
		while (index >= 0 && index < options.length) {
			if (!options[index]!.disabled) return index;
			index += delta;
		}
		return Math.min(options.length - 1, Math.max(0, start));
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.isComposing || event.keyCode === 229) return;
		const current = activeKey ?? -1;
		let target: number | undefined;
		switch (event.key) {
			case 'ArrowDown':
				target = nextEnabled(Math.min(options.length - 1, current + 1), 1);
				break;
			case 'ArrowUp':
				target = nextEnabled(Math.max(0, current < 0 ? 0 : current - 1), -1);
				break;
			case 'End':
				target = nextEnabled(options.length - 1, -1);
				break;
			case 'Home':
				target = nextEnabled(0, 1);
				break;
			default:
				return;
		}
		event.preventDefault();
		void activate(target);
	}
</script>

<ZProvider direction="rtl" motion="reduced">
	<ZStack direction="column" gap="small">
		<ZStack gap="small" wrap>
			<ZButton variant="secondary" onclick={() => activate(0)}>首项</ZButton>
			<ZButton variant="secondary" onclick={() => activate(499)}>第500项</ZButton>
			<ZButton variant="secondary" onclick={() => activate(999)}>末项</ZButton>
			<ZButton variant="secondary" onclick={() => activateSmooth(749)}>
				减少动画下请求平滑定位
			</ZButton>
		</ZStack>
		<ZInput
			aria-label="虚拟环境焦点owner"
			aria-controls="environment-options"
			aria-expanded="true"
			aria-activedescendant={activeId}
			role="combobox"
			readonly
			value={activeKey === undefined ? '尚未激活选项' : `当前环境 ${activeKey + 1}`}
			onkeydown={handleKeydown}
		/>
		<ZVirtualList
			aria-label="可键盘定位的环境选项"
			bind:controller
			height={220}
			id="environment-options"
			itemDisabled={(option) => option.disabled}
			itemId={(option) => optionIds.get(option.id)}
			itemKey={(option) => option.id}
			itemRole="option"
			itemSelected={(option) => option.id === activeKey}
			itemSize={40}
			items={options}
			onItemMount={mountOption}
			onRangeChange={synchronizeActiveId}
			role="listbox"
		>
			{#snippet item(option, index)}
				<ZText tone={option.disabled ? 'muted' : 'default'}
					>{index + 1}. {option.label}{option.disabled ? '（禁用）' : ''}</ZText
				>
			{/snippet}
		</ZVirtualList>
		<ZText tone="muted" size="small">
			controller先把目标key纳入窗口；真实option挂载后，焦点owner才设置aria-activedescendant。当前Provider强制减少动画，smooth请求会降级为即时定位。
		</ZText>
	</ZStack>
</ZProvider>
