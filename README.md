Reador Node.js Client
=====================

Simple Node.js asynchronous client for [Reador.net[(http://reador.net/).

### Installation

```npm install reader-client```

### Example

```javascript
var ReadorClient = require('reador-client');

var client = new ReadorClient("username", "password");

client.Search(["#duck", "#rabbit", "#cow"], function(search) {
	search.Load(function(items) {
		console.log(items);
	});
	search.TagsCloud(function(tags) {
		console.log(tags);
	});
});
```

### API

*Yes it's the typescript definition output*.

```typescript
class Client {
    authentification: {
        username: string;
        password: string;
    };
    constructor(username: string, password: string);
    Searches(callback: (response: Search[]) => void): void;
    Search(tags: string[], callback: (search: Search) => void, params?: {
        lang?: string;
        name?: string;
    }): void;
    SearchLoadDelete(tags: string[], callback: (result: Item[]) => void): void;
    SearchTagsCloudDelete(tags: string[], callback: (result: Tag[]) => void): void;
}

class Search {
    id: number;
    name: string;
    createdAt: Date;
    lang: string;
    tags: string[];
    private _client;
    constructor(client: Client);
    TagsCloud(callback: (tags: Tag[]) => void): void;
    Load(callback: (tags: Item[]) => void): void;
    Delete(callback?: () => void): void;
}

interface Tag {
    text: string;
    link: string;
    weight: number;
    filter_type: string;
}

interface Item {
    uri: string;
    title: string;
    similarity: number;
    date: string;
    description: string[];
    filters: {
        filter_type?: string;
        prop?: string;
        uri?: string;
        value?: string;
        kind?: string;
    }[];
    props: {
        [x: string]: {
            [x: string]: {
                [x: string]: string;
            };
        };
    };
}
```
