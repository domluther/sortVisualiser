// Main application state
const state = {
	numbers: [],
	currentStep: 0,
	maxStep: 0,
	isAscending: true,
	isDetailedMode: false,
	steps: [],
};

// DOM elements
const sortContainer = document.getElementById("sort-container");
const nextButton = document.getElementById("next-btn");
const resetButton = document.getElementById("reset-btn");
const sortDirectionToggle = document.getElementById("sort-direction");
const detailedModeToggle = document.getElementById("detailed-mode");
const explanationElement = document.getElementById("explanation");

// Initialize the application
function init() {
	generateRandomNumbers();
	calculateSortSteps();
	renderCurrentStep();

	nextButton.addEventListener("click", handleNextStep);
	resetButton.addEventListener("click", handleReset);
	sortDirectionToggle.addEventListener("change", handleDirectionChange);
	detailedModeToggle.addEventListener("change", handleModeChange);

	// Add keyboard event listeners
	document.addEventListener("keydown", handleKeyDown);
}

// Handle keyboard shortcuts
function handleKeyDown(event) {
	if (event.key.toLowerCase() === "n") {
		handleNextStep();
	} else if (event.key.toLowerCase() === "r") {
		handleReset();
	}
}

// Generate 8 random numbers between 1 and 99
function generateRandomNumbers() {
	state.numbers = [];
	for (let i = 0; i < 8; i++) {
		state.numbers.push(Math.floor(Math.random() * 99) + 1);
	}
	state.currentStep = 0;
}

// Calculate all the steps of the insertion sort
function calculateSortSteps() {
	const array = [...state.numbers];
	state.steps = [];

	// Add initial state as first step
	state.steps.push({
		array: [...array],
		sorted: 1,
		current: null,
		description: "Starting with an unsorted array.",
	});

	// Perform insertion sort and save each step
	for (let i = 1; i < array.length; i++) {
		const current = array[i];

		// Simple mode doesn't show this step
		if (state.isDetailedMode) {
			// Save step showing which element will be inserted
			state.steps.push({
				array: [...array],
				sorted: i,
				current: i,
				description: `Taking element ${current} and inserting it into the correct position in the sorted list.`,
			});
		}

		let j = i - 1;
		let insertPosition = j + 1;

		// For detailed mode, save every shift step
		if (state.isDetailedMode) {
			// Compare with all elements in sorted list
			while (
				j >= 0 &&
				(state.isAscending ? array[j] > current : array[j] < current)
			) {
				const arrayCopy = [...array];

				// Store the current value temporarily
				const temp = arrayCopy[j + 1];
				// Shift the larger value right
				arrayCopy[j + 1] = arrayCopy[j];

				state.steps.push({
					array: arrayCopy,
					sorted: i + 1,
					current: j,
					movedValue: temp,
					// description: `Shifting ${arrayCopy[j]} to the right to make room.`,
					description: `${current} is ${state.isAscending ? "smaller" : "larger"} than ${arrayCopy[j]}, so goes before.`,
				});

				j--;
				insertPosition = j + 1;
			}
		} else {
			// For simple mode, just find the insertion position without showing steps
			while (
				j >= 0 &&
				(state.isAscending ? array[j] > current : array[j] < current)
			) {
				j--;
			}
			insertPosition = j + 1;
		}

		// Perform the actual insertion
		const arrayCopy = [...array];
		const valueToInsert = arrayCopy[i];

		// Remove the value from its original position
		arrayCopy.splice(i, 1);
		// Insert it at the correct position
		arrayCopy.splice(insertPosition, 0, valueToInsert);

		// Update the working array for future iterations
		for (let k = 0; k < array.length; k++) {
			array[k] = arrayCopy[k];
		}

		// Both modes show the completed insertion
		state.steps.push({
			array: [...array],
			sorted: i + 1,
			current: insertPosition,
			description: `Inserted ${current} in its correct position.`,
		});
	}

	// Final sorted array
	state.steps.push({
		array: [...array],
		sorted: array.length,
		current: null,
		description: "The array is now fully sorted.",
	});

	state.maxStep = state.steps.length - 1;
}

// Render the current step of the sort
function renderCurrentStep() {
	const step = state.steps[state.currentStep];

	if (!step) return;

	// Update the explanation
	explanationElement.textContent = step.description;

	// Create the step element
	const stepElement = document.createElement("div");
	stepElement.className = "sort-step";
	stepElement.setAttribute("data-step", `Step ${state.currentStep}:`);

	// Create the boxes for this step
	for (let i = 0; i < step.array.length; i++) {
		const box = document.createElement("div");
		box.className = "number-box";

		if (i === step.current) {
			box.classList.add("current");
		} else if (i < step.sorted) {
			box.classList.add("sorted");
		} else {
			box.classList.add("unsorted");
		}

		box.textContent = step.array[i];
		stepElement.appendChild(box);
	}

	// If there's a moved value in detailed mode, show it
	if (step.movedValue !== undefined) {
		const movedValueDisplay = document.createElement("div");
		movedValueDisplay.className = "moved-value";
		movedValueDisplay.textContent = `Moving: ${step.movedValue}`;
		stepElement.appendChild(movedValueDisplay);
	}

	// Add the step to the container
	sortContainer.appendChild(stepElement);

	// Update the next button
	if (state.currentStep === state.maxStep) {
		nextButton.disabled = true;
	} else {
		nextButton.textContent = "Next Step";
	}

	// Scroll to the bottom
	window.scrollTo(0, document.body.scrollHeight);
}

// Handle next button click
function handleNextStep() {
	if (state.currentStep === state.maxStep) {
		handleReset();
		return;
	}

	state.currentStep++;
	renderCurrentStep();
}

// Handle reset button click
function handleReset() {
	sortContainer.innerHTML = "";
	nextButton.disabled = false;
	generateRandomNumbers();
	calculateSortSteps();
	renderCurrentStep();
}

// Handle direction toggle change
function handleDirectionChange() {
	state.isAscending = !sortDirectionToggle.checked;
	handleReset();
}

// Handle mode toggle change
function handleModeChange() {
	state.isDetailedMode = detailedModeToggle.checked;
	handleReset(); // Simply reset when mode changes
}

// Initialize the application
init();
