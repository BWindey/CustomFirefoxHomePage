document.addEventListener("DOMContentLoaded", function () {
	fill_time();
	fill_date();
	fill_links_from_json();

	// Update time every second
	setInterval(fill_time, 1_000);
	// Update date every minute
	setInterval(fill_date, 60_000);
});

//===: get username :===
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
		promptLinkDiv.className = 'prompt_link';
		promptLinkDiv.innerHTML = `
			<p>
				<span class="col-01">➜</span>
				<span class="col-02">tree</span>
				<span class="col-04">${category}/</span>
			</p>
		`;
		actual_category_container.appendChild(promptLinkDiv);

		// show category name as responde (from ls -T)
		let resPromptDiv = document.createElement('div');
		resPromptDiv.className = 'res_prompt';
		resPromptDiv.innerHTML = `
			<p class="res_folder">${category}/</p>
			${Object.entries(links).map(([name, url]) => `
				<p>└── <a href="${url}" target="_blank">${name}</a></p>
			`).join("")}
		`;

		actual_category_container.appendChild(resPromptDiv);
		links_sections.appendChild(actual_category_container);
	});
}

//===: current date implementation :===
function fill_date() {
	const current_date_element = document.getElementById('current_date');
	const now = new Date();
	const month = now.toLocaleString('default', { month: 'short' });
	const day = now.getDate();

	current_date_element.textContent = `${month} ${day}`;
}

//===: current time implementation :===
function fill_time() {
	const current_time_element = document.getElementById('current_time');
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');

	// Don't update if it's still the same, might save some performance this way
	if (!current_time_element.textContent.endsWith(minutes)) {
		current_time_element.textContent = `${hours}:${minutes}`;
	}
};
