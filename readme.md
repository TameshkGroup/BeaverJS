![Alt text](./icon.svg?raw=true "BeaverJS icon")

> Don't use this at this time.
> Because this framework is in the pre-build phase.

**BeaverJS** is going to be a Web UI Framework to aim the web front-end developers to write web applications easier than when they are using other frameworks like Vue, React, Svelte or Angular.



BeaverJS brings **easier template structure** as you can see in the following example.

```html
<div>
	<ExampleElement
		prop1{}="this.value1"
		prop2{="this.value2"
		prop3}="this.value3"
		$="$.childElementFn(this.value)"
    />
</div>
```

In the above example, the ExampleElement tag represents a BeaverJS element usage. In the call of this element, three properties are used.

- The value1 is bounded bi-directionally to prop1 of the child element. 
- The value2 bounded one-directionally to prop2 and when value2 changes prop2 in the child element will automatically change.
- The value3 bounded one-directionally reversed to prop3. So the value3 will change when the prop3 has changed.
- The $ attribute in Beaver Elements and HTMLElements brings you the ability to access their properties and method. This script scope will run automatically when each current element properties that used in the scope changes.

BreaverJS uses **class structure** for defining **Elements**.

```typescript
import { BVRElement, AsPuya } from 'beaver';

@AsPuya
export default class App extends BVRElement {
    $$elements = { ExampleElement }
    value1 = 'testValue';
	value2 = 'testValue';
	value3 = 'testValue';

	template: html`
		<div>
			<ExampleElement
				prop1{}="this.value1"
				prop2{="this.value2"
				prop3}="this.value3"
				$="$.childElementFn(this.value)"
        	/>
        </div>
	`
}
```

