/// <reference path="typings/node/node.d.ts"/>

var restler = require('restler');

module Reador {

	var endpoint = "https://app.reador.net";

	var throwError = (data, response) => {
		console.log(data);
		throw new Error("Reador API error (" + response.statusCode + ")");
	};

	export class Client {
		public authentification: { username: string; password: string };

		constructor(username: string, password: string) {
			this.authentification = { username: username, password: password };
		}

		public Searches(callback: (response: Search[]) => void): void {
			restler.get(endpoint + '/searches.json', this.authentification)
				.on('success', (data: any[]) => {
				//console.log(data);
					var result = [];
					if (data && data.forEach) {
						data.forEach((search) => {
							var s = new Search(this);
							s.name = search.name;
							s.id = parseInt(search.id);
							s.createdAt = new Date(search.created_at);

							result.push(s);
						});
					}
					callback(result);
				}).on('fail', throwError);
		}

		public Search(tags: string[], callback: (search: Search) => void, params?: {
			lang?: string;
			name?: string;
			//"private"?: boolean;
		}): void {

			var name = params && params.name ? params.name : tags.join(" ");
			restler.postJson(endpoint + '/searches/createFromString.json', {
				tags: tags,
				lang: params && params.lang ? params.lang : "en",
				name: name,
				//"private": params && params.private ? params.private : false
			}, this.authentification).on('success', (data) => {
				var s = new Search(this);
				s.name = name,
					s.id = parseInt(data.id);
				s.createdAt = new Date(data.created_at);
				callback(s);
			}).on('fail', throwError);
		}

		public SearchLoadDelete(tags: string[], callback: (result: Item[]) => void): void {
			this.Search(tags, (search: Search) => {
				search.Load((t: Item[]) => {
					callback(t);
					search.Delete();
				});
			});
		}

		public SearchTagsCloudDelete(tags: string[], callback: (result: Tag[]) => void) : void {
			this.Search(tags, (search: Search) => {
				search.TagsCloud((t: Tag[]) => {
					callback(t);
					search.Delete();
				});
			});
		}
	}

	export class Search {
		public id: number;
		public name: string;
		public createdAt: Date;
		public lang: string;
		public tags: string[];

		private _client: Client;

		constructor(client: Client) {
			if (!client) {
				throw new Error("A client object is required");
			}
			this._client = client;
		}

		public TagsCloud(callback: (tags: Tag[]) => void): void {
			restler.get(endpoint + '/searches/tagsCloud/' + this.id + '.json', this._client.authentification)
				.on('success', callback)
				.on('fail', throwError);
		}

		public Load(callback: (tags: Item[]) => void): void {
			restler.get(endpoint + '/searches/' + this.id + '.json', this._client.authentification)
				.on('success', callback)
				.on('fail', throwError);
		}

		public Delete(callback?: () => void): void {
			var r = restler.del(endpoint + '/searches/' + this.id, this._client.authentification)
				.on('fail', throwError);
			if (callback) {
				r.on('success', callback);
			}
		}
	}

	export interface Tag {
		text: string;
		link: string;
		weight: number;
		filter_type: string;
	}

	export interface Item {
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
			[prop: string]: {
				[uri: string]: {
					[type: string]: string
				}
			}
		}
	}

}

module.exports = Reador.Client;
