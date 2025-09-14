// Main application state
const state = {
	numbers: [],
	currentStep: 0,
	maxStep: 0,
	isAscending: true,
	isDetailedMode: false,
	isLetters: false, // New property to track if using letters instead of numbers
	arrayLength: 8, // New property to track array length
	steps: [],
	algorithm: null, // Track current algorithm
	isCustomArray: false, // Track if using custom array instead of random
	customArrayInput: "", // Store the custom array input string
};

// DOM elements
const sortContainer = document.getElementById("sort-container");
const nextButton = document.getElementById("next-btn");
const resetButton = document.getElementById("reset-btn");
const sortDirectionToggle = document.getElementById("sort-direction");
const detailedModeToggle = document.getElementById("detailed-mode");
const lettersToggle = document.getElementById("letters-mode"); // Toggle for letters/numbers
const arraySizeDisplay = document.getElementById("array-size-display"); // Display for array size
const increaseSizeButton = document.getElementById("increase-size"); // Button to increase array size
const decreaseSizeButton = document.getElementById("decrease-size"); // Button to decrease array size
const explanationElement = document.getElementById("explanation");
const algorithmSelector = document.getElementById("algorithm-selector");
const customArrayToggle = document.getElementById("custom-array-mode"); // Toggle for custom array mode
const customArrayInput = document.getElementById("custom-array-input"); // Input field for custom array
const customArraySection = document.getElementById("custom-array-section"); // Section containing custom array input
const applyCustomArrayButton = document.getElementById("apply-custom-array"); // Apply button for custom array

// Initialize the application
function init() {
	state.algorithm = 'merge'; // Default to merge sort
	
	// Set the algorithm selector to match the default
	algorithmSelector.value = state.algorithm;
	
	// Update the heading to match the algorithm
	document.querySelector("h1").textContent =
		`${state.algorithm.charAt(0).toUpperCase() + state.algorithm.slice(1)} Sort Visualization 🦆`;
	
	generateRandomArray();	
	calculateSortSteps();
	renderCurrentStep();

	// Set up event listeners
	nextButton.addEventListener("click", handleNextStep);
	resetButton.addEventListener("click", handleReset);
	sortDirectionToggle.addEventListener("change", handleDirectionChange);
	detailedModeToggle.addEventListener("change", handleModeChange);
	lettersToggle.addEventListener("change", handleDataTypeChange);
	increaseSizeButton.addEventListener("click", handleIncreaseSize);
	decreaseSizeButton.addEventListener("click", handleDecreaseSize);
	algorithmSelector.addEventListener("change", handleAlgorithmChange);
	customArrayToggle.addEventListener("change", handleCustomArrayModeChange);
	customArrayInput.addEventListener("input", handleCustomArrayInputChange);
	customArrayInput.addEventListener("blur", validateCustomArrayInput);
	customArrayInput.addEventListener("keypress", handleCustomArrayKeyPress);
	applyCustomArrayButton.addEventListener("click", handleApplyCustomArray);

	// Set initial array size value in the display
	arraySizeDisplay.textContent = state.arrayLength;

	// Initialize custom array input
	state.customArrayInput = customArrayInput.value;

	// Add keyboard event listeners
	document.addEventListener("keydown", handleKeyDown);
}

// Handle keyboard shortcuts
function handleKeyDown(event) {
	if (event.key.toLowerCase() === "n") {
		// Only proceed if the next button is not disabled
		if (!nextButton.disabled) {
			handleNextStep();
		}
	} else if (event.key.toLowerCase() === "r") {
		handleReset();
	}
}

// Validate and parse custom array input
function validateAndParseCustomArray(input) {
	if (!input || input.trim() === "") {
		return { isValid: false, error: "Please enter some values" };
	}

	// Split by commas and clean up whitespace
	const values = input.split(",").map(val => val.trim()).filter(val => val !== "");
	
	if (values.length === 0) {
		return { isValid: false, error: "Please enter at least one value" };
	}

	if (values.length > 12) {
		return { isValid: false, error: "Maximum 12 values allowed" };
	}

	// Check if all values are consistent (all numbers or all letters)
	const isAllNumbers = values.every(val => /^\d+$/.test(val));
	const isAllLetters = values.every(val => /^[A-Za-z]$/.test(val));

	if (!isAllNumbers && !isAllLetters) {
		return { 
			isValid: false, 
			error: "All values must be either numbers (1,2,3) or single letters (A,B,C)" 
		};
	}

	if (isAllNumbers) {
		// Convert to numbers and validate range
		const numbers = values.map(val => parseInt(val, 10));
		const invalidNumbers = numbers.filter(num => num < 1 || num > 99);
		
		if (invalidNumbers.length > 0) {
			return { 
				isValid: false, 
				error: "Numbers must be between 1 and 99" 
			};
		}

		return { 
			isValid: true, 
			values: numbers, 
			isLetters: false 
		};
	} else {
		// Convert letters to uppercase
		const letters = values.map(val => val.toUpperCase());
		
		return { 
			isValid: true, 
			values: letters, 
			isLetters: true 
		};
	}
}

// Display error message for custom array input
function showCustomArrayError(message) {
	// Remove any existing error message
	const existingError = document.querySelector('.error-message');
	if (existingError) {
		existingError.remove();
	}

	// Add error styling to input
	customArrayInput.classList.add('error');

	// Create and show error message
	const errorDiv = document.createElement('div');
	errorDiv.className = 'error-message';
	errorDiv.textContent = message;
	customArrayInput.parentElement.appendChild(errorDiv);
}

// Clear error message for custom array input
function clearCustomArrayError() {
	customArrayInput.classList.remove('error');
	const existingError = document.querySelector('.error-message');
	if (existingError) {
		existingError.remove();
	}
}

// Generate random array of specified length
function generateRandomArray() {
	state.numbers = [];
	
	// Check if we're using custom array mode
	if (state.isCustomArray) {
		// Validate and parse the custom input
		const result = validateAndParseCustomArray(state.customArrayInput);
		
		if (result.isValid) {
			state.numbers = [...result.values];
			// Update the letters mode based on input type
			state.isLetters = result.isLetters;
			// Update letters toggle to match the custom input
			lettersToggle.checked = result.isLetters;
			// Clear any error messages
			clearCustomArrayError();
		} else {
			// Show error and fall back to default array
			showCustomArrayError(result.error);
			// Create a simple default array to prevent empty state
			state.numbers = state.isLetters ? ['A', 'B', 'C'] : [3, 1, 2];
		}
	} else {
		// Generate random array as before
		if (state.isLetters) {
			// Generate random letters (A-Z)
			for (let i = 0; i < state.arrayLength; i++) {
				// Generate a random uppercase letter (ASCII code 65-90)
				const randomLetter = String.fromCharCode(
					Math.floor(Math.random() * 26) + 65,
				);
				state.numbers.push(randomLetter);
			}
		} else {
			// Generate random numbers (1-99)
			for (let i = 0; i < state.arrayLength; i++) {
				state.numbers.push(Math.floor(Math.random() * 99) + 1);
			}
		}
	}
	
	state.currentStep = 0;
}

// Calculate all the steps of the sort based on currently selected algorithm
function calculateSortSteps() {
	if (state.algorithm === "insertion") {
		calculateInsertionSortSteps();
	} else if (state.algorithm === "bubble") {
		calculateBubbleSortSteps();
	} else if (state.algorithm === "merge") {
		calculateMergeSortSteps();
	}
}

// Calculate all the steps of the insertion sort
function calculateInsertionSortSteps() {
	const array = [...state.numbers];
	state.steps = [];

	// Add initial state as first step
	state.steps.push({
		array: [...array],
		sorted: 1,
		current: null,
		description: `The first element ${array[0]} is already sorted. The rest are unsorted and will be inserted one by one.`,
	});

	// Perform insertion sort and save each step
	for (let i = 1; i < array.length; i++) {
		const current = array[i];

		// Add pass indicator for each insertion
		state.steps.push({
			array: [...array],
			sorted: i,
			current: i, // Highlight the first unsorted element
			passNumber: i,
			isPassHeader: true, // Mark this as a pass header
			description: `Pass ${i}: First unsorted element is ${current}.`,
		});

		let j = i - 1;
		let insertPosition = i; // Default to end of sorted portion

		// For detailed mode, show comparison steps to find insertion position
		if (state.isDetailedMode) {
			// Compare with elements in sorted portion from right to left
			while (j >= 0) {
				// Show comparison step
				state.steps.push({
					array: [...array],
					sorted: i,
					current: i, // Element being inserted
					compared: j, // Element being compared with
					description: `Comparing ${current} with ${array[j]}. ${current} is ${
						state.isAscending 
							? (array[j] > current ? "smaller, so continue searching left" : "larger or equal, so insertion point found")
							: (array[j] < current ? "larger, so continue searching left" : "smaller or equal, so insertion point found")
					}.`,
				});

				// Check if we need to continue searching
				const needToMoveLeft = state.isAscending ? array[j] > current : array[j] < current;
				
				if (needToMoveLeft) {
					j--;
					insertPosition = j + 1;
				} else {
					insertPosition = j + 1;
					break;
				}
			}

			// If we've compared with all elements and reached the beginning
			if (j < 0 && insertPosition === 0) {
				state.steps.push({
					array: [...array],
					sorted: i,
					current: i,
					insertionPoint: 0,
					description: `${current} is ${state.isAscending ? "smaller" : "larger"} than all elements in the sorted portion, so goes at the beginning.`,
				});
			} else if (insertPosition < i) {
				// Show where the insertion will happen
				state.steps.push({
					array: [...array],
					sorted: i,
					current: i,
					insertionPoint: insertPosition,
					description: `Found insertion point for ${current} at position ${insertPosition}.`,
				});
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
		let insertionDescription = `Inserted ${current}`;
		let insertedAfterPosition = null; // Track if we need to show "inserted after" arrow
		
		// Add position context based on where it was inserted
		if (insertPosition === 0) {
			insertionDescription += ` before ${array[insertPosition + 1]}`;
		} else if (insertPosition === i) {
			// Inserted at the end of the sorted portion (before any unsorted elements)
			insertionDescription += `  after ${array[insertPosition - 1]}.`;
			// Only show arrow in detailed mode
			if (state.isDetailedMode) {
				insertedAfterPosition = insertPosition - 1; // Show arrow on the right of this position
			}
		} else {
			// Inserted somewhere in the middle
			insertionDescription += ` after ${array[insertPosition - 1]} and before ${array[insertPosition + 1]}.`;
		}
		
		state.steps.push({
			array: [...array],
			sorted: i + 1,
			current: insertPosition,
			insertedAfter: insertedAfterPosition,
			description: insertionDescription,
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

// Calculate all the steps of the bubble sort
function calculateBubbleSortSteps() {
	const array = [...state.numbers];
	state.steps = [];

	// Add initial state as first step
	state.steps.push({
		array: [...array],
		current: null,
		compared: null,
		description: "Starting with an unsorted array.",
	});

	let swapped;
	let previousPassSwapped = false; // Track if previous pass had swaps
	const n = array.length;
	let sortedElements = 0;

	// Outer loop for bubble sort passes
	do {
		swapped = false;

		// Start of new pass - show in both detailed and simple modes
		let passDescription;
		// This will happen on the first pass
		if (sortedElements === 0) {
			passDescription = `Starting pass ${sortedElements + 1} through the array.`;
		} else {
			passDescription = `A swap was needed in the previous pass, so we need another pass. Starting pass ${sortedElements + 1}.`;
		}
		
		state.steps.push({
			array: [...array],
			current: null,
			compared: null,
			sortedCount: sortedElements,
			description: passDescription,
		});

		// Inner loop for comparisons within a pass
		for (let i = 0; i < n - 1 - sortedElements; i++) {
			// Show comparison of adjacent elements
			if (state.isDetailedMode) {
				state.steps.push({
					array: [...array],
					current: i,
					compared: i + 1,
					sortedCount: sortedElements,
					description: `Comparing ${array[i]} and ${array[i + 1]}.`,
				});
			}

			// Check if elements need to be swapped
			const needSwap = state.isAscending
				? array[i] > array[i + 1]
				: array[i] < array[i + 1];

			// If elements need to be swapped
			if (needSwap) {
				// Swap elements
				const temp = array[i];
				array[i] = array[i + 1];
				array[i + 1] = temp;
				swapped = true;

				// Show swapped elements
				state.steps.push({
					array: [...array],
					current: i + 1,
					compared: i,
					swapped: true,
					sortedCount: sortedElements,
					description: `Swapped ${array[i]} and ${temp} because ${temp} is ${
						state.isAscending ? "greater" : "smaller"
					}.`,
				});
			} else if (state.isDetailedMode) {
				// No swap needed, but show in detailed mode
				state.steps.push({
					array: [...array],
					current: i,
					compared: i + 1,
					sortedCount: sortedElements,
					description: `No swap needed. ${array[i]} is already ${
						state.isAscending ? "smaller or equal to" : "greater or equal to"
					} ${array[i + 1]}.`,
				});
			}
		}

		// After each pass, the largest/smallest element is in the correct position
		sortedElements++;

		// Show that one element is now in final position (if not in detailed mode or if it's the last element)
		if (!state.isDetailedMode || !swapped) {
			const position = n - sortedElements;
			state.steps.push({
				array: [...array],
				current: null,
				compared: null,
				finalPosition: position,
				sortedCount: sortedElements,
				description: `Element ${array[position]} is now in its final position.`,
			});
		}

		// Track if this pass had swaps for the next pass description
		previousPassSwapped = swapped;

		// Optimization: if no swaps occurred in a pass, the array is sorted
		if (!swapped && sortedElements < n - 1) {
			state.steps.push({
				array: [...array],
				current: null,
				compared: null,
				sortedCount: n,
				description: "No swaps needed in this pass. The array is sorted!",
			});
			break;
		}
	} while (swapped && sortedElements < n - 1);

	// Final sorted array
	state.steps.push({
		array: [...array],
		current: null,
		compared: null,
		sortedCount: n,
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

	// Add a helpful note for merge sort in detailed mode
	if (state.algorithm === "merge" && state.isDetailedMode && state.currentStep === 0) {
		const detailedModeNote = document.createElement("div");
		detailedModeNote.className = "detailed-mode-note";
		detailedModeNote.innerHTML = "📝 <strong>Detailed mode</strong> shows every comparison step. For a clearer overview, try <strong>Simple mode</strong> instead.";
		sortContainer.appendChild(detailedModeNote);
	}

	// Check if this is the start of a new pass or phase
	if (state.algorithm === "bubble" && 
		step.current === null && 
		step.compared === null && 
		step.sortedCount !== undefined &&
		!step.finalPosition) {
		
		// Add a pass header for bubble sort
		const passHeader = document.createElement("div");
		passHeader.className = "pass-header";
		passHeader.textContent = `Pass ${step.sortedCount + 1}`;
		sortContainer.appendChild(passHeader);
	} else if (state.algorithm === "insertion" && 
		step.isPassHeader) {
		
		// Add a pass header for insertion sort
		const passHeader = document.createElement("div");
		passHeader.className = "pass-header";
		passHeader.textContent = `Pass ${step.passNumber}`;
		sortContainer.appendChild(passHeader);
	} else if (state.algorithm === "merge" && 
		step.phase === 'dividing' && 
		state.currentStep === 0) {
		
		// Add a phase header for merge sort dividing phase
		const phaseHeader = document.createElement("div");
		phaseHeader.className = "pass-header";
		phaseHeader.textContent = "Dividing";
		sortContainer.appendChild(phaseHeader);
	} else if (state.algorithm === "merge" && 
		step.phase === 'merging' && 
		state.currentStep > 0 &&
		state.steps[state.currentStep - 1].phase === 'dividing') {
		
		// Add a phase header for merge sort merging phase (first merge step)
		const phaseHeader = document.createElement("div");
		phaseHeader.className = "pass-header";
		phaseHeader.textContent = "Merging";
		sortContainer.appendChild(phaseHeader);
	}

	// Create the step element
	const stepElement = document.createElement("div");
	stepElement.className = "sort-step";
	if (state.algorithm === "merge") {
		stepElement.classList.add("merge-sort");
		stepElement.setAttribute("data-array-size", state.arrayLength);
	}
	stepElement.setAttribute("data-step", `Step ${state.currentStep}:`);

	// Handle merge sort rendering with visual separation
	if (state.algorithm === "merge" && step.subarrays) {
		// For merge sort, render subarrays with visual separation
		step.subarrays.forEach((subarray, subarrayIndex) => {
			// Create a container for each subarray
			const subarrayContainer = document.createElement("div");
			subarrayContainer.className = "subarray-container";
			
			// Create boxes for this subarray
			for (let i = subarray.start; i <= subarray.end; i++) {
				const box = document.createElement("div");
				box.className = "number-box";
				
				// Add merge sort specific styling
				if (step.phase === 'dividing') {
					box.classList.add("dividing");
				} else if (step.phase === 'merging') {
					box.classList.add("merging");
				}
				
				// Highlight comparing elements in detailed merge mode
				if (step.comparingLeftIndex !== undefined && i === step.comparingLeftIndex) {
					box.classList.add("comparing-left");
				} else if (step.comparingRightIndex !== undefined && i === step.comparingRightIndex) {
					box.classList.add("comparing-right");
				}
				
				// Highlight selected element during merge
				if (step.selectedElement !== undefined && i === step.selectedElement) {
					box.classList.add("selected");
				}
				
				// Highlight subarrays being merged
				if (step.mergingLeft && i >= step.mergingLeft.start && i <= step.mergingLeft.end) {
					box.classList.add("merging-left");
				} else if (step.mergingRight && i >= step.mergingRight.start && i <= step.mergingRight.end) {
					box.classList.add("merging-right");
				}
				
				// Highlight split elements in detailed mode
				if (step.splitStart !== undefined && step.splitEnd !== undefined) {
					if (i >= step.splitStart && i <= step.splitEnd) {
						if (i <= step.splitMid) {
							box.classList.add("split-left");
						} else {
							box.classList.add("split-right");
						}
					}
				}
				
				box.textContent = step.array[i];
				subarrayContainer.appendChild(box);
			}
			
			stepElement.appendChild(subarrayContainer);
		});
	} else {
		// Original rendering for insertion and bubble sort
		// Create the boxes for this step
		for (let i = 0; i < step.array.length; i++) {
			const box = document.createElement("div");
			box.className = "number-box";

			// Apply appropriate styling based on the algorithm
			if (state.algorithm === "insertion") {
				if (i === step.current) {
					box.classList.add("current");
				} else if (i === step.compared) {
					box.classList.add("compared");
				} else if (i === step.insertionPoint) {
					box.classList.add("insertion-point");
				} else if (i === step.insertedAfter) {
					box.classList.add("inserted-after");
				} else if (i < step.sorted) {
					box.classList.add("sorted");
				} else {
					box.classList.add("unsorted");
				}
			} else if (state.algorithm === "bubble") {
				if (i === step.current || i === step.compared) {
					box.classList.add(step.swapped ? "swapped" : "compared");
				} else if (
					step.sortedCount !== undefined &&
					i >= step.array.length - step.sortedCount
				) {
					box.classList.add("sorted");
				} else {
					box.classList.add("unsorted");
				}

				// Highlight final position element
				if (step.finalPosition !== undefined && i === step.finalPosition) {
					box.classList.add("final-position");
				}
			}

			box.textContent = step.array[i];
			stepElement.appendChild(box);
		}
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
		nextButton.disabled = false;
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
	generateRandomArray();
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

// Handle data type toggle change (numbers or letters)
function handleDataTypeChange() {
	state.isLetters = lettersToggle.checked;
	handleReset();
}

// Handle increase size button click
function handleIncreaseSize() {
	if (state.arrayLength < 12) {
		state.arrayLength++;
		arraySizeDisplay.textContent = state.arrayLength;
		handleReset();
	}
}

// Handle decrease size button click
function handleDecreaseSize() {
	if (state.arrayLength > 4) {
		state.arrayLength--;
		arraySizeDisplay.textContent = state.arrayLength;
		handleReset();
	}
}

// Handle algorithm selection change
function handleAlgorithmChange() {
	state.algorithm = algorithmSelector.value;
	// Update the heading
	document.querySelector("h1").textContent =
		`${state.algorithm.charAt(0).toUpperCase() + state.algorithm.slice(1)} Sort Visualization 🦆`;
	handleReset();
}

// Handle custom array mode toggle
function handleCustomArrayModeChange() {
	state.isCustomArray = customArrayToggle.checked;
	
	// Show/hide the custom array input section
	if (state.isCustomArray) {
		customArraySection.style.display = 'block';
		// Focus on the input field for better UX
		customArrayInput.focus();
		// Disable array size controls when using custom array
		increaseSizeButton.disabled = true;
		decreaseSizeButton.disabled = true;
		// Disable letters toggle as custom input determines the data type
		lettersToggle.disabled = true;
	} else {
		customArraySection.style.display = 'none';
		// Re-enable array size controls
		increaseSizeButton.disabled = false;
		decreaseSizeButton.disabled = false;
		// Re-enable letters toggle
		lettersToggle.disabled = false;
		clearCustomArrayError();
	}
	
	handleReset();
}

// Handle custom array input changes (real-time)
function handleCustomArrayInputChange() {
	// Clear error styling as user types
	clearCustomArrayError();
	
	// Store the input value in state
	state.customArrayInput = customArrayInput.value;
}

// Validate custom array input when field loses focus
function validateCustomArrayInput() {
	if (state.isCustomArray && customArrayInput.value.trim() !== "") {
		const result = validateAndParseCustomArray(customArrayInput.value);
		if (!result.isValid) {
			showCustomArrayError(result.error);
		}
	}
}

// Handle Enter key press in custom array input
function handleCustomArrayKeyPress(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		handleApplyCustomArray();
	}
}

// Handle Apply button click for custom array
function handleApplyCustomArray() {
	if (!state.isCustomArray) return;
	
	const inputValue = customArrayInput.value.trim();
	if (inputValue === "") {
		showCustomArrayError("Please enter some values");
		return;
	}
	
	const result = validateAndParseCustomArray(inputValue);
	if (!result.isValid) {
		showCustomArrayError(result.error);
		return;
	}
	
	// Clear any existing errors
	clearCustomArrayError();
	
	// Apply the custom array
	state.numbers = result.values;
	state.isLetters = result.isLetters;
	state.arrayLength = result.values.length;
	
	// Update the letters toggle to match the detected type (but keep it disabled)
	lettersToggle.checked = state.isLetters;
	
	// Update array size display
	arraySizeDisplay.textContent = state.arrayLength;
	
	// Recalculate and render
	state.currentStep = 0;
	calculateSortSteps();
	sortContainer.innerHTML = "";
	renderCurrentStep();
}

function calculateMergeSortSteps() {
	const array = [...state.numbers];
	state.steps = [];
	
	// Add initial state
	state.steps.push({
		array: [...array],
		subarrays: [{ start: 0, end: array.length - 1 }],
		phase: 'dividing',
		description: "Starting with the original array. We'll divide it into smaller subarrays.",
	});

	if (state.isDetailedMode) {
		// Detailed mode: show each step of splitting
		const workingSubarrays = [{ start: 0, end: array.length - 1 }];
		
		while (workingSubarrays.some(sub => sub.start < sub.end)) {
			const newSubarrays = [];
			let hasSplit = false;
			
			for (const subarray of workingSubarrays) {
				if (subarray.start < subarray.end) {
					// Split this subarray
					const mid = Math.floor((subarray.start + subarray.end) / 2);
					newSubarrays.push({ start: subarray.start, end: mid });
					newSubarrays.push({ start: mid + 1, end: subarray.end });
					hasSplit = true;
				} else {
					// Keep single elements as they are
					newSubarrays.push(subarray);
				}
			}
			
			if (hasSplit) {
				// Sort subarrays by start position for consistent display
				newSubarrays.sort((a, b) => a.start - b.start);
				
				// Calculate sizes of subarrays that are larger than 1
				const subarraysLargerThanOne = newSubarrays.filter(sub => sub.start < sub.end);
				const sizes = subarraysLargerThanOne.map(sub => sub.end - sub.start + 1);
				
				let description;
				if (sizes.length === 0) {
					description = "Array divided into individual subarrays of size 1.";
				} else {
					const uniqueSizes = [...new Set(sizes)];
					if (uniqueSizes.length === 1) {
						// All remaining subarrays are the same size
						description = `Split arrays into smaller pieces. ${sizes.length} ${sizes.length === 1 ? 'subarray' : 'subarrays'} of size ${uniqueSizes[0]} remaining.`;
					} else {
						// Different sizes - show the actual sizes
						sizes.sort((a, b) => b - a); // Sort descending for better readability
						description = `Split arrays into smaller pieces. Remaining subarray sizes: ${sizes.join(', ')}.`;
					}
				}
				
				state.steps.push({
					array: [...array],
					subarrays: newSubarrays,
					phase: 'dividing',
					description: description,
				});
				
				workingSubarrays.length = 0;
				workingSubarrays.push(...newSubarrays);
			}
		}
	} else {
		// Simple mode: one step from original to individual elements
		const subarrays = [];
		for (let i = 0; i < array.length; i++) {
			subarrays.push({ start: i, end: i });
		}
		
		state.steps.push({
			array: [...array],
			subarrays: subarrays,
			phase: 'dividing',
			description: "Array divided into individual subarrays of size 1.",
		});
	}
	
	// Now add the merging phase
	calculateMergeSteps(array);

	state.maxStep = state.steps.length - 1;
}

function calculateMergeSteps(originalArray) {
	// Start with individual elements (size 1 subarrays)
	let currentSubarrays = [];
	for (let i = 0; i < originalArray.length; i++) {
		currentSubarrays.push({ start: i, end: i });
	}
	
	// Keep merging until we have one array
	while (currentSubarrays.length > 1) {
		const newSubarrays = [];
		let workingArray = [...originalArray];
		
		// In detailed mode, we need to process pairs sequentially to maintain visual state
		if (state.isDetailedMode) {
			// Process each merge pair one at a time
			for (let i = 0; i < currentSubarrays.length; i += 2) {
				const left = currentSubarrays[i];
				const right = currentSubarrays[i + 1];
				
				if (right) {
					// Show detailed merge for this pair
					calculateDetailedMerge(workingArray, left, right, currentSubarrays, newSubarrays);
					
					// Create the merged subarray
					const mergedSubarray = { start: left.start, end: right.end };
					
					// The actual merge was already done in calculateDetailedMerge
					// Just add to newSubarrays
					newSubarrays.push(mergedSubarray);
				} else {
					// Odd number of subarrays, keep the last one as is
					newSubarrays.push(left);
				}
			}
		} else {
			// Simple mode: process all pairs at once
			for (let i = 0; i < currentSubarrays.length; i += 2) {
				const left = currentSubarrays[i];
				const right = currentSubarrays[i + 1];
				
				if (right) {
					// Merge left and right subarrays
					const mergedSubarray = { start: left.start, end: right.end };
					
					// Perform the actual merge sort on this segment
					const leftArray = workingArray.slice(left.start, left.end + 1);
					const rightArray = workingArray.slice(right.start, right.end + 1);
					const merged = mergeSortedArrays(leftArray, rightArray, state.isAscending);
					
					// Update the working array with the sorted segment
					for (let j = 0; j < merged.length; j++) {
						workingArray[mergedSubarray.start + j] = merged[j];
					}
					
					newSubarrays.push(mergedSubarray);
				} else {
					// Odd number of subarrays, keep the last one as is
					newSubarrays.push(left);
				}
			}
		}
		
		// Add the merge step (for simple mode or final result of detailed steps)
		if (!state.isDetailedMode || newSubarrays.length === 1) {
			let description;
			if (newSubarrays.length === 1) {
				const subarraySize = newSubarrays[0].end - newSubarrays[0].start + 1;
				description = `Merged into 1 sorted array of size ${subarraySize}.`;
			} else {
				// Calculate sizes of all subarrays
				const sizes = newSubarrays.map(sub => sub.end - sub.start + 1);
				const uniqueSizes = [...new Set(sizes)];
				
				if (uniqueSizes.length === 1) {
					// All subarrays are the same size
					description = `Merged into ${newSubarrays.length} sorted arrays of size ${uniqueSizes[0]}.`;
				} else {
					// Different sizes - show the actual sizes
					description = `Merged into ${newSubarrays.length} sorted arrays of sizes ${sizes.join(', ')}.`;
				}
			}
			
			state.steps.push({
				array: workingArray,
				subarrays: newSubarrays,
				phase: 'merging',
				description: description,
			});
		}
		
		// Update for next iteration
		currentSubarrays = newSubarrays;
		originalArray.splice(0, originalArray.length, ...workingArray);
	}
}

function calculateDetailedMerge(workingArray, left, right, allSubarrays, completedMerges) {
	const leftArray = workingArray.slice(left.start, left.end + 1);
	const rightArray = workingArray.slice(right.start, right.end + 1);
	
	// Simple approach: build exactly what we want to show
	// 1. Completed merges 
	// 2. Current merge pair
	// 3. Remaining individual unprocessed elements
	
	const subarraysToDisplay = [];
	
	// Add completed merges
	subarraysToDisplay.push(...completedMerges);
	
	// Track which positions are already covered by completed merges
	const coveredPositions = new Set();
	for (const subarray of completedMerges) {
		for (let i = subarray.start; i <= subarray.end; i++) {
			coveredPositions.add(i);
		}
	}
	
	// Add current merge pair (only if not already covered by completed merges)
	if (!coveredPositions.has(left.start)) {
		subarraysToDisplay.push(left);
		for (let i = left.start; i <= left.end; i++) {
			coveredPositions.add(i);
		}
	}
	if (!coveredPositions.has(right.start)) {
		subarraysToDisplay.push(right);
		for (let i = right.start; i <= right.end; i++) {
			coveredPositions.add(i);
		}
	}
	
	// Add any remaining uncovered positions as individual elements
	for (let i = 0; i < workingArray.length; i++) {
		if (!coveredPositions.has(i)) {
			subarraysToDisplay.push({ start: i, end: i });
		}
	}
	
	subarraysToDisplay.sort((a, b) => a.start - b.start);
	
	// Show the initial state before merging these two subarrays
	state.steps.push({
		array: [...workingArray],
		subarrays: subarraysToDisplay,
		phase: 'merging',
		mergingLeft: left,
		mergingRight: right,
		description: `Merging [${leftArray.join(', ')}] and [${rightArray.join(', ')}].`,
	});
	
	let leftIndex = 0;
	let rightIndex = 0;
	let mergedResult = [];
	// Keep track of original arrays and the merge progress separately
	let displayArray = [...workingArray];
	let mergeTargetIndex = left.start;
	
	// Show each comparison and selection
	while (leftIndex < leftArray.length && rightIndex < rightArray.length) {
		const leftValue = leftArray[leftIndex];
		const rightValue = rightArray[rightIndex];
		
		// Show comparison step
		const comparisonSubarrays = [...completedMerges];
		
		// Track covered positions
		const comparisonCoveredPositions = new Set();
		for (const subarray of completedMerges) {
			for (let i = subarray.start; i <= subarray.end; i++) {
				comparisonCoveredPositions.add(i);
			}
		}
		
		// Add current merge pair
		comparisonSubarrays.push(left, right);
		for (let i = left.start; i <= left.end; i++) {
			comparisonCoveredPositions.add(i);
		}
		for (let i = right.start; i <= right.end; i++) {
			comparisonCoveredPositions.add(i);
		}
		
		// Add any remaining uncovered positions as individual elements
		for (let i = 0; i < workingArray.length; i++) {
			if (!comparisonCoveredPositions.has(i)) {
				comparisonSubarrays.push({ start: i, end: i });
			}
		}
		comparisonSubarrays.sort((a, b) => a.start - b.start);
		
		state.steps.push({
			array: [...workingArray],
			subarrays: comparisonSubarrays,
			phase: 'merging',
			mergingLeft: left,
			mergingRight: right,
			comparingLeftIndex: left.start + leftIndex,
			comparingRightIndex: right.start + rightIndex,
			description: `Comparing ${leftValue} and ${rightValue}. ${state.isAscending ? 
				(leftValue <= rightValue ? `${leftValue} is smaller` : `${rightValue} is smaller`) : 
				(leftValue >= rightValue ? `${leftValue} is larger` : `${rightValue} is larger`)}, so it goes next.`,
		});
		
		// Select the appropriate value
		const shouldTakeLeft = state.isAscending ? leftValue <= rightValue : leftValue >= rightValue;
		
		if (shouldTakeLeft) {
			mergedResult.push(leftValue);
			displayArray[mergeTargetIndex] = leftValue;
			leftIndex++;
		} else {
			mergedResult.push(rightValue);
			displayArray[mergeTargetIndex] = rightValue;
			rightIndex++;
		}
		mergeTargetIndex++;
		
		// Create the display arrays for the current step
		// We need to show the merged portion, and the remaining unprocessed portions
		const progressSubarrays = [...completedMerges];
		
		// Create a display array that shows merged progress but preserves original unprocessed values
		const stepDisplayArray = [...workingArray]; // Start with original values
		// Overwrite only the merged portion with the new sorted values
		for (let i = 0; i < mergedResult.length; i++) {
			stepDisplayArray[left.start + i] = mergedResult[i];
		}
		
		// Track which positions are covered by completed merges
		const progressCoveredPositions = new Set();
		for (const subarray of completedMerges) {
			for (let i = subarray.start; i <= subarray.end; i++) {
				progressCoveredPositions.add(i);
			}
		}
		
		// Add the current merged portion (where results are being placed)
		if (mergedResult.length > 0) {
			const mergedPortion = { start: left.start, end: left.start + mergedResult.length - 1 };
			progressSubarrays.push(mergedPortion);
			for (let i = mergedPortion.start; i <= mergedPortion.end; i++) {
				progressCoveredPositions.add(i);
			}
		}
		
		// Add remaining unprocessed portions from left array (starting after the merged portion)
		const leftUnprocessedStart = left.start + mergedResult.length;
		if (leftIndex < leftArray.length && leftUnprocessedStart <= left.end) {
			const leftRemaining = { start: leftUnprocessedStart, end: left.end };
			progressSubarrays.push(leftRemaining);
			for (let i = leftRemaining.start; i <= leftRemaining.end; i++) {
				progressCoveredPositions.add(i);
			}
		}
		
		// Add remaining unprocessed portions from right array (original positions)
		if (rightIndex < rightArray.length) {
			const rightRemaining = { start: right.start + rightIndex, end: right.end };
			progressSubarrays.push(rightRemaining);
			for (let i = rightRemaining.start; i <= rightRemaining.end; i++) {
				progressCoveredPositions.add(i);
			}
		}
		
		// Add any other uncovered individual elements
		for (let i = 0; i < workingArray.length; i++) {
			if (!progressCoveredPositions.has(i)) {
				progressSubarrays.push({ start: i, end: i });
			}
		}
		
		progressSubarrays.sort((a, b) => a.start - b.start);
		
		state.steps.push({
			array: [...stepDisplayArray],
			subarrays: progressSubarrays,
			phase: 'merging',
			selectedElement: left.start + mergedResult.length - 1,
			description: `Added ${mergedResult[mergedResult.length - 1]} to merged array. Progress: [${mergedResult.join(', ')}].`,
		});
	}
	
	// Add remaining elements from left array
	while (leftIndex < leftArray.length) {
		mergedResult.push(leftArray[leftIndex]);
		displayArray[mergeTargetIndex] = leftArray[leftIndex];
		leftIndex++;
		mergeTargetIndex++;
		
		const progressSubarrays = [...completedMerges];
		
		// Track covered positions
		const leftCoveredPositions = new Set();
		for (const subarray of completedMerges) {
			for (let i = subarray.start; i <= subarray.end; i++) {
				leftCoveredPositions.add(i);
			}
		}
		
		// Create a display array that shows merged progress but preserves original unprocessed values
		const leftStepDisplayArray = [...workingArray]; // Start with original values
		// Overwrite only the merged portion with the new sorted values
		for (let i = 0; i < mergedResult.length; i++) {
			leftStepDisplayArray[left.start + i] = mergedResult[i];
		}
		
		// Add the current merged portion
		if (mergedResult.length > 0) {
			const mergedPortion = { start: left.start, end: left.start + mergedResult.length - 1 };
			progressSubarrays.push(mergedPortion);
			for (let i = mergedPortion.start; i <= mergedPortion.end; i++) {
				leftCoveredPositions.add(i);
			}
		}
		
		// Add remaining left portion if any
		if (leftIndex < leftArray.length) {
			const leftRemaining = { start: left.start + leftIndex, end: left.end };
			progressSubarrays.push(leftRemaining);
			for (let i = leftRemaining.start; i <= leftRemaining.end; i++) {
				leftCoveredPositions.add(i);
			}
		}
		
		// Add any remaining uncovered positions as individual elements
		for (let i = 0; i < workingArray.length; i++) {
			if (!leftCoveredPositions.has(i)) {
				progressSubarrays.push({ start: i, end: i });
			}
		}
		progressSubarrays.sort((a, b) => a.start - b.start);
		
		state.steps.push({
			array: [...leftStepDisplayArray],
			subarrays: progressSubarrays,
			phase: 'merging',
			selectedElement: left.start + mergedResult.length - 1,
			description: `Added remaining ${leftArray[leftIndex - 1]} from left array. Progress: [${mergedResult.join(', ')}].`,
		});
	}
	
	// Add remaining elements from right array
	while (rightIndex < rightArray.length) {
		mergedResult.push(rightArray[rightIndex]);
		displayArray[mergeTargetIndex] = rightArray[rightIndex];
		rightIndex++;
		mergeTargetIndex++;
		
		const progressSubarrays = [...completedMerges];
		
		// Track covered positions
		const rightCoveredPositions = new Set();
		for (const subarray of completedMerges) {
			for (let i = subarray.start; i <= subarray.end; i++) {
				rightCoveredPositions.add(i);
			}
		}
		
		// Create a display array that shows merged progress but preserves original unprocessed values
		const rightStepDisplayArray = [...workingArray]; // Start with original values
		// Overwrite only the merged portion with the new sorted values
		for (let i = 0; i < mergedResult.length; i++) {
			rightStepDisplayArray[left.start + i] = mergedResult[i];
		}
		
		// Add the current merged portion
		if (mergedResult.length > 0) {
			const mergedPortion = { start: left.start, end: left.start + mergedResult.length - 1 };
			progressSubarrays.push(mergedPortion);
			for (let i = mergedPortion.start; i <= mergedPortion.end; i++) {
				rightCoveredPositions.add(i);
			}
		}
		
		// Add any remaining uncovered positions as individual elements
		for (let i = 0; i < workingArray.length; i++) {
			if (!rightCoveredPositions.has(i)) {
				progressSubarrays.push({ start: i, end: i });
			}
		}
		progressSubarrays.sort((a, b) => a.start - b.start);
		
		state.steps.push({
			array: [...rightStepDisplayArray],
			subarrays: progressSubarrays,
			phase: 'merging',
			selectedElement: left.start + mergedResult.length - 1,
			description: `Added remaining ${rightArray[rightIndex - 1]} from right array. Progress: [${mergedResult.join(', ')}].`,
		});
	}
	
	// Update the original array with merged result
	for (let i = 0; i < mergedResult.length; i++) {
		workingArray[left.start + i] = mergedResult[i];
	}
}

function mergeSortedArrays(left, right, ascending = true) {
	const result = [];
	let leftIndex = 0;
	let rightIndex = 0;
	
	while (leftIndex < left.length && rightIndex < right.length) {
		const shouldTakeLeft = ascending 
			? left[leftIndex] <= right[rightIndex]
			: left[leftIndex] >= right[rightIndex];
			
		if (shouldTakeLeft) {
			result.push(left[leftIndex]);
			leftIndex++;
		} else {
			result.push(right[rightIndex]);
			rightIndex++;
		}
	}
	
	// Add remaining elements
	while (leftIndex < left.length) {
		result.push(left[leftIndex]);
		leftIndex++;
	}
	
	while (rightIndex < right.length) {
		result.push(right[rightIndex]);
		rightIndex++;
	}
	
	return result;
}

// Initialize the application
init();
