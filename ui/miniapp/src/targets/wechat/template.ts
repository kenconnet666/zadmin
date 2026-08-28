export const WECHAT_RUNTIME_TEMPLATE = `<template name="zadmin-children">
  <block wx:for="{{children}}" wx:key="id">
    <template is="zadmin-node" data="{{node:item}}" />
  </block>
</template>
<template name="zadmin-node">
  <block wx:if="{{node.kind === 'text'}}">{{node.value}}</block>
  <view wx:elif="{{node.name === 'view'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" hidden="{{node.attributes.hidden}}" data-zid="{{node.id}}" bindtap="__zadmin_tap">
    <template is="zadmin-children" data="{{children:node.children}}" />
  </view>
  <text wx:elif="{{node.name === 'text'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" selectable="{{node.attributes.selectable}}" data-zid="{{node.id}}" bindtap="__zadmin_tap">
    <template is="zadmin-children" data="{{children:node.children}}" />
  </text>
  <button wx:elif="{{node.name === 'button'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" disabled="{{node.attributes.disabled}}" loading="{{node.attributes.loading}}" open-type="{{node.attributes['open-type']}}" data-zid="{{node.id}}" bindtap="__zadmin_tap">
    <template is="zadmin-children" data="{{children:node.children}}" />
  </button>
  <input wx:elif="{{node.name === 'input'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" type="{{node.attributes.type}}" value="{{node.attributes.value}}" placeholder="{{node.attributes.placeholder}}" disabled="{{node.attributes.disabled}}" data-zid="{{node.id}}" bindinput="__zadmin_input" bindconfirm="__zadmin_confirm" />
  <image wx:elif="{{node.name === 'image'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" src="{{node.attributes.src}}" mode="{{node.attributes.mode}}" lazy-load="{{node.attributes['lazy-load']}}" data-zid="{{node.id}}" bindload="__zadmin_load" binderror="__zadmin_error" />
  <block wx:else>
    <template is="zadmin-children" data="{{children:node.children}}" />
  </block>
</template>`;

export function pageTemplate(importPath = '../../templates/runtime.wxml'): string {
	return `<import src="${importPath}"/>\n<template is="zadmin-children" data="{{children:root.children}}"/>\n`;
}
