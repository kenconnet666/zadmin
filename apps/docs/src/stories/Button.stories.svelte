<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Button } from '@zadmin/zui';
	import { createRawSnippet } from 'svelte';

	const label = (text: string) =>
		createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
	const { Story } = defineMeta({
		title: 'ZUI/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['small', 'medium', 'large'] },
			variant: { control: 'select', options: ['primary', 'secondary', 'danger', 'ghost'] }
		},
		args: {
			children: label('Save'),
			size: 'medium',
			variant: 'primary'
		}
	});
</script>

<Story name="Primary" />
<Story name="Secondary" args={{ variant: 'secondary' }} />
<Story name="Danger" args={{ variant: 'danger' }} />
<Story name="Loading" args={{ loading: true }} />
<Story name="Disabled" args={{ disabled: true }} />
