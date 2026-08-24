import { Button, Text, View } from '@tarojs/components';
import { createSignal, For } from 'solid-js';

const initialItems = Array.from({ length: 200 }, (_, index) => index);

export default function Index() {
	const [items, setItems] = createSignal(initialItems);
	const rotate = () => setItems((current) => [...current.slice(1), current[0]]);
	return (
		<View>
			<Button onClick={rotate}>rotate</Button>
			<For each={items()}>{(item) => <Text>{item}</Text>}</For>
		</View>
	);
}
