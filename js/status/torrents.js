/*
 * Module responsible for fetching, storing and sorting torrent objects.
 */
var Torrents = (function ($) {
	var pub = {};
		// Stores all torrent data, using array so it can be sorted.
	var torrents = [];
	var globalInformation = {};

	pub.getAll = function () {
		return torrents;
	};

	//Sorts the torrents.
	// Can sort by name, size, progress, speed, eta, position
	pub.sort = function(by, invert) {
		torrents.sortByParameter(by, invert);
		return this;
	}

	pub.getById = function (val) {
		var i;
		for (i = 0; i < torrents.length; i += 1) {
			if (torrents[i].id === val) {
				return torrents[i];
			}
		}
		return false;
	};

	pub.getGlobalInformation = function () {
		return globalInformation;
	};

	pub.cleanup = function () {
		var i;
		for (i = 0; i < torrents.length; i += 1) {
			torrents[i] = null;
		}
		torrents = null;
	};

	pub.update = function () {
		var that = this;
		var api = Deluge.api("web.update_ui", [[
				"queue",
				"name",
				"total_size",
				"state",
				"progress",
				"download_payload_rate",
				"upload_payload_rate",
				"eta",
				"ratio",
				"is_auto_managed",
				"num_seeds",
				"total_seeds",
				"num_peers",
				"total_peers",
				"seeds_peers_ratio",
				"is_finished",
				"is_seed",
				"active_time",
				"seeding_time",
				"time_added",
				"tracker_host",
				"tracker_status",
				"label"
			],
				{}
			],
				{ timeout: 2000 }
			)
			.success(function (response) {
				var id, tmp;
				// Reset torrents array.
				that.cleanup();
				torrents = [];
				for (id in response.torrents) {
					if (response.torrents.hasOwnProperty(id)) {
						torrents.push(new Torrent(id, response.torrents[id]));
					}
				}

				for (id in response.filters.state) {
					if (response.filters.state.hasOwnProperty(id)) {
						tmp = response.filters.state[id];
						globalInformation[tmp[0].toLowerCase()] = tmp[1];
					}
				}

				for (id in response.filters) {
					if (response.filters.hasOwnProperty(id)) {
						$("#filter_"+id).empty();
						for (var i = 0; i < response.filters[id].length; i++) {

							var text = response.filters[id][i][0];
							text = (text == "" ? "<blank>" : text);
							text += " (" + response.filters[id][i][1] + ")";

							$("#filter_"+id).append($("<option>", {
								value: response.filters[id][i][0],
								text: text
							}));

						}
						$("#filter_"+id).val(localStorage["filter_"+id] || "All");
					}
				}

				response = null;

				if (localStorage.debugMode.toBoolean()) {
					console.log(torrents);
				}
			});

		return api;
	};

	return pub;
}(jQuery));
