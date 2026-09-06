<script lang="ts">
	import {
		ZMenuItem,
		ZMenubar,
		ZMenubarContent,
		ZMenubarMenu,
		ZMenubarTrigger,
		ZProvider,
		ZText,
		type SelectionKey
	} from '@zadmin/zui';

	let value = $state<SelectionKey | null>(null);
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZMenubar bind:value aria-label="قائمة التطبيق">
		<ZMenubarMenu value="account">
			<ZMenubarTrigger>الحساب</ZMenubarTrigger>
			<ZMenubarContent
				><ZMenuItem value="profile">الملف الشخصي</ZMenuItem><ZMenuItem value="signout"
					>تسجيل الخروج</ZMenuItem
				></ZMenubarContent
			>
		</ZMenubarMenu>
		<ZMenubarMenu value="view">
			<ZMenubarTrigger>العرض</ZMenubarTrigger>
			<ZMenubarContent
				><ZMenuItem value="compact">مضغوط</ZMenuItem><ZMenuItem value="comfortable">مريح</ZMenuItem
				></ZMenubarContent
			>
		</ZMenubarMenu>
	</ZMenubar>
	<ZText tone="muted"
		>open value = {value ?? 'null'}；RTL方向下ArrowLeft/Right按逻辑方向切换。</ZText
	>
</ZProvider>
