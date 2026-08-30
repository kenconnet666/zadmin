<script lang="ts">
	import { ZFileUpload, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZFileUpload
		accept="image/png,image/jpeg"
		chooseLabel="选择头像"
		dropLabel="拖放一张PNG或JPEG头像"
		inputLabel="选择头像文件"
		maxFiles={1}
		multiple={false}
		required
	/>
	<ZFileUpload
		disabled
		chooseLabel="上传已锁定"
		dropLabel="当前环境禁止上传"
		inputLabel="上传已锁定"
	/>
</ZStack>
