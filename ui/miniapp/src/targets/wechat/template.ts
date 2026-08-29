export const WECHAT_TEMPLATE_DEPTH = 24;

function childrenTemplate(depth: number): string {
	return `<template name="zadmin-children-${depth}">
  <block wx:for="{{children}}" wx:key="id">
    <template is="zadmin-node-${depth}" data="{{node:item}}" />
  </block>
</template>`;
}

function childCall(depth: number): string {
	return depth < WECHAT_TEMPLATE_DEPTH
		? `<template is="zadmin-children-${depth + 1}" data="{{children:node.children}}" />`
		: '';
}

function nodeTemplate(depth: number): string {
	const children = childCall(depth);
	return `<template name="zadmin-node-${depth}">
  <block wx:if="{{node.kind === 'text'}}">{{node.value}}</block>
  <view wx:elif="{{node.name === 'view'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" hidden="{{node.attributes.hidden}}" data-zid="{{node.id}}" bindtap="__zadmin_tap">
    ${children}
  </view>
  <text wx:elif="{{node.name === 'text'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" selectable="{{node.attributes.selectable}}" data-zid="{{node.id}}" bindtap="__zadmin_tap">
    ${children}
  </text>
  <button wx:elif="{{node.name === 'button'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" disabled="{{node.attributes.disabled}}" loading="{{node.attributes.loading}}" open-type="{{node.attributes['open-type']}}" data-zid="{{node.id}}" bindtap="__zadmin_tap">
    ${children}
  </button>
  <input wx:elif="{{node.name === 'input'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" type="{{node.attributes.type}}" value="{{node.attributes.value}}" placeholder="{{node.attributes.placeholder}}" disabled="{{node.attributes.disabled}}" data-zid="{{node.id}}" bindinput="__zadmin_input" bindconfirm="__zadmin_confirm" />
  <image wx:elif="{{node.name === 'image'}}" id="{{node.attributes.id}}" class="{{node.attributes.class}}" style="{{node.attributes.style}}" src="{{node.attributes.src}}" mode="{{node.attributes.mode}}" lazy-load="{{node.attributes['lazy-load']}}" data-zid="{{node.id}}" bindload="__zadmin_load" binderror="__zadmin_error" />
  <block wx:else>
    ${children}
  </block>
</template>`;
}

export const WECHAT_RUNTIME_TEMPLATE = Array.from(
	{ length: WECHAT_TEMPLATE_DEPTH + 1 },
	(_value, depth) => `${childrenTemplate(depth)}\n${nodeTemplate(depth)}`
).join('\n');

export function pageTemplate(importPath = '../../templates/runtime.wxml'): string {
	return `<import src="${importPath}"/>\n<template is="zadmin-children-0" data="{{children:root.children}}"/>\n`;
}
