const search_bar = document.getElementById('search');
const completion_suggestion = document.getElementById('completion_suggestion');

document.addEventListener("DOMContentLoaded", function () {
	adjust_inputfield_width();
});

/*
 * Make sure that the width of the input-field is as big as its content
 * because the completion-suggestion is a seperate element that hugs the
 * input-field.
 */
function adjust_inputfield_width() {
	const value = search_bar.value || search_bar.placeholder;
	const new_width = value.length;
	search_bar.style.width = `${new_width}ch`;
}
search_bar.addEventListener('input', adjust_inputfield_width);


/*
 * Get all the the names of the shortcuts/links and see which ones start with
 * what's already typed in the searchbar.
 */
function get_possible_completions() {
	let possibilities = [];

	for (let actual_link_element of document.getElementsByClassName('actual_link')) {
		const link_name = actual_link_element.firstChild.textContent;

		if (link_name.startsWith(search_bar.value)) {
			possibilities.push(link_name);
		}
	}

	return possibilities;
}


/*
 * Update the completion-suggestion element behind the input element.
 */
function update_completion_suggestion() {
	const possibilities = get_possible_completions();

	if (possibilities.length == 1) {
		const completion = possibilities[0];
		const rest = completion.substring(search_bar.value.length);
		completion_suggestion.innerHTML = rest;
	} else {
		completion_suggestion.innerHTML = '';
	}
}
search_bar.addEventListener('input', update_completion_suggestion);


/*
 * Helper function to find longest matching prefix in a list, prefix starting
 * from 'char_index' inside each word (for when you know that f.e. the first
 * 4 characters already match -> more efficient).
 * Use 'max_iterations' to determine what the max length is to check up towards
 * (max_index = char_index + max_iterations).
 */
function find_longest_matching_prefix(list, char_index = 0, max_iterations = 100) {
	let iterations = 0;

	while (iterations < max_iterations) {
		if (char_index >= list[0].length) return char_index;

		const char = list[0][char_index];
		for (let i = 1; i < list.length; i++) {
			if (char_index >= list[i].length) return char_index;
			if (list[i][char_index] != char)  return char_index
		}

		char_index++;
		iterations++;
	}
	if (iterations == max_iterations) return -1;

	return char_index;
}

/*
 * Function that will check if it can complete anything from the shortcuts/links
 * based on what's already typed. Only will activate when 'tab' was pressed
 * without modifiers.
 */
function try_complete(event) {
	if (event.code !== 'Tab' || event.ctrlKey || event.altKey || event.metaKey) {
		return;
	}
	event.preventDefault();

	let possibilities = get_possible_completions();

	if (possibilities.length == 1) {
		search_bar.value = possibilities[0];
	} else {
		// Find longest matching prefix
		let i = search_bar.value.length;
		const char_index = find_longest_matching_prefix(possibilities, i);

		if (char_index < 0) {
			console.error("Reached MAX_ITERATIONS while trying completions");
			return;
		} else {
			search_bar.value = possibilities[0].substring(0, char_index);
		}
	}

	// Make sure that the input-size and completion suggestion are up to date
	adjust_inputfield_width();
	update_completion_suggestion();
}
search_bar.addEventListener('keydown', try_complete);

/*
 * Custom form-submit, first try if it matches one of the shortcuts/links, then
 * use duckduckgo if no link was found.
 */
function on_search_enter(event) {
	event.preventDefault(); // prevent form from submitting

	const search_val = search_bar.value;

	// Search all links
	for (let actual_link_element of document.getElementsByClassName('actual_link')) {
		const link_link = actual_link_element.href;
		const link_name = actual_link_element.firstChild.textContent;

		if (link_name === search_val) {
			console.log("Found match, should reroute");
			window.location.href = link_link;
			return;
		}
	}

	// Not found anything?
	window.location.href = `https://duckduckgo.com/?q=${search_val}`;
}
