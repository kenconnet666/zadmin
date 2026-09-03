<script lang="ts">
	import { ZForm, ZFormField, ZInput, type ZFormController } from '../src/entrypoints/index.js';

	let controller = $state<ZFormController | null>(null);
	$effect(() => {
		if (!controller) return;
		return controller.subscribeField('email', () => {
			throw new Error('FormController subscription must not execute during SSR.');
		});
	});
</script>

<ZForm bind:controller data-testid="form-controller-ssr">
	<ZFormField name="email" label="Email"><ZInput /></ZFormField>
</ZForm>
