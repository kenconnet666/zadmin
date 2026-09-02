<script lang="ts">
	import { ZButton, ZPinInput, ZStack, ZText } from '@zadmin/zui';

	let submitted = $state('尚未提交');
	function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }): void {
		event.preventDefault();
		submitted = String(new FormData(event.currentTarget).get('externalOtp') ?? 'missing');
	}
</script>

<form id="pin-external-form-demo" onsubmit={submit}></form>
<ZStack gap="medium" align="start">
	<ZPinInput
		defaultValue="2468"
		form="pin-external-form-demo"
		inputLabel={(index, length) => `外部表单验证码第${index + 1}位，共${length}位`}
		length={4}
		name="externalOtp"
	/>
	<ZStack direction="row" gap="small">
		<ZButton form="pin-external-form-demo" type="submit">提交外部表单</ZButton>
		<ZButton form="pin-external-form-demo" type="reset" variant="secondary">重置</ZButton>
	</ZStack>
	<ZText tone="muted">FormData：{submitted}</ZText>
</ZStack>
