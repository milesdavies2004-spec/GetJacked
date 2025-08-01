
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("user-form");
  const resultsSection = document.getElementById("results");
  const overviewDiv = document.getElementById("overview");
  const workoutDiv = document.getElementById("workout-plan");
  const nutritionDiv = document.getElementById("nutrition-plan");
  document.getElementById("year").textContent = new Date().getFullYear();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Collect inputs
    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);
    const age = parseInt(document.getElementById("age").value, 10);
    const gender = document.getElementById("gender").value;
    const days = parseInt(document.getElementById("days").value, 10);

    // Calculate recommendations
    const plan = generatePlan({ weight, height, age, gender, days });

    // Render output
    overviewDiv.innerHTML = plan.overviewHTML;
    workoutDiv.innerHTML = plan.workoutHTML;
    nutritionDiv.innerHTML = plan.nutritionHTML;
    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({ behavior: "smooth" });
  });
});

// Core logic
function generatePlan({ weight, height, age, gender, days }) {
  // BMR via Mifflin-St Jeor
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  // Activity multiplier
  let activity = 1.375; // lightly active
  if (days >= 3 && days <= 4) activity = 1.55;
  else if (days >= 5 && days <= 6) activity = 1.725;
  else if (days >= 7) activity = 1.9;

  const tdee = bmr * activity;
  const surplus = 300;
  const calories = Math.round(tdee + surplus);

  const protein = Math.round(1.8 * weight); // g
  const fat = Math.round(0.8 * weight); // g
  const proteinCal = protein * 4;
  const fatCal = fat * 9;
  let carbCal = calories - (proteinCal + fatCal);
  if (carbCal < 0) {
    // Adjust if negative
    carbCal = calories * 0.4;
  }
  const carbs = Math.round(carbCal / 4);

  // Overview HTML
  const overviewHTML = `
    <h3 class="text-lg font-semibold">At a Glance</h3>
    <ul class="list-disc list-inside">
        <li><strong>Calories / day:</strong> ${calories} kcal</li>
        <li><strong>Protein:</strong> ${protein} g</li>
        <li><strong>Fats:</strong> ${fat} g</li>
        <li><strong>Carbs:</strong> ${carbs} g</li>
    </ul>
  `;

  // Workout split determination
  const split = getSplit(days);
  const workoutHTML = renderWorkoutPlan(split);

  // Nutrition breakdown
  const nutritionHTML = `
    <h3 class="text-lg font-semibold">Macronutrient Breakdown</h3>
    <p class="mb-2">Aim for these macros each day:</p>
    <table class="w-full text-left">
        <thead>
            <tr><th class="border px-2 py-1">Macro</th><th class="border px-2 py-1">Grams</th></tr>
        </thead>
        <tbody>
            <tr><td class="border px-2 py-1">Protein</td><td class="border px-2 py-1">${protein}</td></tr>
            <tr><td class="border px-2 py-1">Fats</td><td class="border px-2 py-1">${fat}</td></tr>
            <tr><td class="border px-2 py-1">Carbs</td><td class="border px-2 py-1">${carbs}</td></tr>
        </tbody>
    </table>
    <p class="mt-4 text-sm text-gray-600">Tip: Spread protein evenly across meals and prioritize whole foods.</p>
  `;

  return { overviewHTML, workoutHTML, nutritionHTML };
}

// Determine workout split based on days/week
function getSplit(days) {
  const workouts = {
    "Full Body": [
      "Barbell Squat – 4×6",
      "Bench Press – 4×6",
      "Barbell Row – 4×6",
      "Overhead Press – 3×8",
      "Lat Pulldown – 3×8",
      "Romanian Deadlift – 3×8",
      "Plank – 3×60s"
    ],
    "Upper Body": [
      "Bench Press – 4×6",
      "Bent-Over Row – 4×6",
      "Overhead Press – 3×8",
      "Pull-Ups – 3×Max",
      "Bicep Curls – 3×10",
      "Tricep Dips – 3×10"
    ],
    "Lower Body": [
      "Back Squat – 4×6",
      "Deadlift – 3×5",
      "Leg Press – 3×10",
      "Lunges – 3×10 each",
      "Hamstring Curl – 3×12",
      "Standing Calf Raise – 4×12"
    ],
    "Push": [
      "Bench Press – 4×6",
      "Incline Dumbbell Press – 3×8",
      "Overhead Press – 3×8",
      "Dumbbell Flyes – 3×12",
      "Tricep Pushdown – 3×12",
      "Skull Crushers – 3×10"
    ],
    "Pull": [
      "Deadlift – 3×5",
      "Pull-Ups – 4×Max",
      "Barbell Row – 4×6",
      "Face Pulls – 3×12",
      "Bicep Curl – 3×10",
      "Hammer Curl – 3×10"
    ],
    "Legs": [
      "Back Squat – 4×6",
      "Romanian Deadlift – 3×8",
      "Leg Press – 3×10",
      "Leg Extension – 3×12",
      "Hamstring Curl – 3×12",
      "Calf Raise – 4×12"
    ],
    "Active Recovery": [
      "30–45 min Light Cardio",
      "Mobility / Stretching 20 min",
      "Foam Rolling 10 min",
      "Optional Core Work"
    ]
  };

  let split = [];
  switch (days) {
    case 1:
      split = ["Full Body"];
      break;
    case 2:
      split = ["Upper Body", "Lower Body"];
      break;
    case 3:
      split = ["Push", "Pull", "Legs"];
      break;
    case 4:
      split = ["Upper Body", "Lower Body", "Push", "Pull"];
      break;
    case 5:
      split = ["Upper Body", "Lower Body", "Push", "Pull", "Legs"];
      break;
    case 6:
      split = ["Push", "Pull", "Legs", "Push", "Pull", "Legs"];
      break;
    default:
      split = ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Active Recovery"];
      break;
  }

  // Map split to workouts
  return split.map((dayName) => ({
    dayName,
    exercises: workouts[dayName]
  }));
}

// Render workout HTML
function renderWorkoutPlan(plan) {
  let html = '<h3 class="text-lg font-semibold">Workout Split</h3>';
  plan.forEach((day, idx) => {
    html += `
      <div class="mt-4">
        <h4 class="font-semibold">Day ${idx + 1}: ${day.dayName}</h4>
        <ul class="list-disc list-inside ml-4">
          ${day.exercises.map(ex => `<li>${ex}</li>`).join("")}
        </ul>
      </div>
    `;
  });
  return html;
}
