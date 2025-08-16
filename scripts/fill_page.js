document.addEventListener("DOMContentLoaded", function () {
	fill_time();
	fill_date();
	fill_links_from_json();

	// Update time every second
	setInterval(fill_time, 1_000);
	// Update date every minute
	setInterval(fill_date, 60_000);

	// When user clicks on searchbar it should go to input, but guard against
	// double clicks or selections.
	document.getElementById('section_middle_search')
		.addEventListener(
			'click',
			function (event) {
				// Do nothing with double or triple clicks
				if (event.detail > 1) return;
				const selection = window.getSelection();
				console.log(selection);
				if (selection.type === "Range") return;
				document.getElementById('search').focus();
			}
		);
});


/*
 * Fetch the 'profile.json' and use it to fill in the page.
 */
async function fill_links_from_json() {
	const links_sections = document.getElementById('section_bottom_links');

	let json_data, data;
	try {
		json_data = await fetch('/profile.json');
		data = await json_data.json();
	} catch (err) {
		links_sections.innerHTML = `
			<p>
				Something went wrong opening '/profile.json' and parsing it:
				${err.message}
			</p>
		`;
	}

	// Create boxes for each element
	Object.entries(data.categories).forEach(([category, links]) => {
		let actual_category_container = document.createElement('div');
		actual_category_container.className = 'generic_link';

		// make each prompt
		let promptLinkDiv = document.createElement('div');
		promptLinkDiv.className = 'tree_prompt';
		promptLinkDiv.innerHTML = `
			<p>
				<span class="colour_yellow">➜</span>
				<span class="colour_blue">tree</span>
				<span>${category}/</span>
			</p>
		`;
		actual_category_container.appendChild(promptLinkDiv);

		// show category name as responde (from ls -T)
		let resPromptDiv = document.createElement('div');
		let link_list = Object.entries(links);

		resPromptDiv.className = 'tree_result';
		resPromptDiv.innerHTML = `
			<p class="colour_green">${category}/</p>
			${link_list.map(([name, url], index) => `
				<p>
					${index + 1 < link_list.length ? '├' : '└'}──
					<a href="${url}" target="_blank" class="actual_link">${name}</a>
				</p>
			`).join("")}
		`;

		actual_category_container.appendChild(resPromptDiv);
		links_sections.appendChild(actual_category_container);
	});
}

/*
 * Fill in the date at the top of the page.
 */
function fill_date() {
	const current_date_element = document.getElementById('current_date');
	const now = new Date();
	const month = now.toLocaleString('default', { month: 'short' });
	const day = now.getDate();

	current_date_element.textContent = `${month} ${day}`;
}

/*
 * Fill in the time at the top of the page.
 */
function fill_time() {
	const current_time_element = document.getElementById('current_time');
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');

	current_time_element.textContent = `${hours}:${minutes}`;
};
