const SUBTEMPLATE_DESCRIPTIONS = {
    // Basic Frameworks
    "5 E's Lesson Plan": "Engage, Explore, Explain, Elaborate, and Evaluate framework for inquiry-based learning",
    "Lesson Seed": "Basic lesson structure with essential components and flexible adaptation options",
    "Horizontal Lesson Planner": "Timeline-based lesson organization with clear progression of activities",
    "SPARK Lesson": "Structured, Progressive, Active, Reflective, Knowledge-based approach to lesson design",

    // Learning Approaches
    "Student-Centered Approach": "Focuses on active learning and student engagement through collaborative activities",
    "Project Based Learning": "Long-term learning through complex, authentic projects and real-world challenges",
    "Team Based Activity": "Collaborative learning experiences that promote cooperation and communication",
    "Universal Design for Learning": "Inclusive teaching approach accommodating diverse learning styles and needs",

    // Content Organization
    "Unit Plan": "Comprehensive overview of connected lessons and learning objectives",
    "Book Summary": "Structured outline for literature analysis and key concepts",
    "Vocabulary List": "Organized collection of key terms with definitions and usage examples",
    "Notes Outline": "Hierarchical organization of lesson content and key points",

    // Special Focus
    "STEM Project": "Integrated science, technology, engineering, and math activities",
    "Technology Integration": "Strategic incorporation of digital tools and resources",
    "Lab + Material List": "Detailed preparation guide for hands-on experimental activities",
    "Learning Situations": "Context-rich scenarios for authentic learning experiences",
    "Multiple Choice Questions": "A set of multiple choice questions for assessment.",
    "Word Problems": "A set of word problems for assessment.",
    "Think-Pair-Share": "A collaborative learning strategy.",
    "Team Building Activity": "An activity designed to foster teamwork and collaboration.",
    "Assessment Outline": "A structured outline for creating assessments.",
    "Evidence Statements": "Statements describing the evidence needed to demonstrate learning.",
    "Jigsaw Activity": "A cooperative learning activity where students become experts on a specific topic.",
    "Quiz Quiz Trade": "A quick and engaging review activity.",
    "Analytic Rubric": "A rubric for assessing student work.",
    "Exit Slip": "A quick assessment given at the end of a lesson.",
    "Class Poll": "A quick way to gauge student understanding.",
    "Quick Check": "A short assessment to check for understanding.",
    "Jeopardy Style": "A game-based review activity.",
    "Self-Assessment": "An assessment where students reflect on their own learning.",
    "Syllabus Template": "A template for creating a syllabus.",
    "Parent Letter": "A template for writing a letter to parents.",
    "Student Update": "A template for updating students on their progress.",
    "IEP Outline": "A template for creating an IEP.",
    "Progress Report": "A template for creating a progress report."
};

// Define popular subtemplates (top 5 per template type)
const POPULAR_SUBTEMPLATES = {
    lesson: [
        "5 E's Lesson Plan",
        "Student-Centered Approach",
        "Project Based Learning",
        "STEM Project",
        "Unit Plan"
    ],
    assessment: [
        "Multiple Choice Questions",
        "Word Problems",
        "Analytic Rubric",
        "Assessment Outline",
        "Exit Slip"
    ],
    feedback: [
        "Class Poll",
        "Quick Check",
        "Jeopardy Style",
        "Quiz Quiz Trade",
        "Self-Assessment"
    ],
    admin: [
        "Syllabus Template",
        "Parent Letter",
        "Student Update",
        "IEP Outline",
        "Progress Report"
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize modals
    const templateModalEl = document.getElementById('templateModal');
    const templateModal = new bootstrap.Modal(templateModalEl);
    const subtemplateModal = new bootstrap.Modal(document.getElementById('subtemplateModal'));
    const personalizationModal = new bootstrap.Modal(document.getElementById('personalizationModal'));
    const quizModal = new bootstrap.Modal(document.getElementById('quizModal')); // Added quiz modal

    // Get templates data from global variable
    const templatesData = window.TEMPLATES_DATA || {};
    templateModal.show();

    // Template variables
    let selectedTemplate = '';
    let currentSubtemplate = '';
    let showingAllSubtemplates = false;

    // DOM elements
    const templateCards = document.querySelectorAll('.template-card');
    const selectedTemplateDisplay = document.getElementById('selectedTemplate');
    const selectedSubtemplateDisplay = document.getElementById('selectedSubtemplate');
    const subtemplateButton = document.getElementById('subtemplateButton');
    const subtemplateContent = document.getElementById('subtemplateContent');
    const subtemplateSearchInput = document.getElementById('subtemplateSearch');
    const lessonForm = document.getElementById('lessonForm');
    const lessonOutput = document.getElementById('lessonPlanOutput');
    const changeTemplateBtn = document.getElementById('changeTemplate');
    const toggleAdvancedBtn = document.getElementById('toggleAdvanced');
    const advancedFields = document.getElementById('advancedFields');
    const sidebar = document.getElementById('historySidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const personalizationForm = document.getElementById('personalizationForm');

    // Load favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('subtemplateFavorites') || '[]');

    // Function to toggle favorite
    function toggleFavorite(subtemplate) {
        const index = favorites.indexOf(subtemplate);
        if (index === -1) {
            favorites.push(subtemplate);
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem('subtemplateFavorites', JSON.stringify(favorites));
        updateSubtemplates(selectedTemplate, subtemplateSearchInput.value);
    }

    // Update subtemplates display with search and favorites
    function updateSubtemplates(template, searchQuery = '') {
        const subtemplates = templatesData[template]?.subtemplates || {};
        let allSubtemplates = [];
        showingAllSubtemplates = searchQuery.length > 0;

        // Collect all subtemplates for the current template
        Object.values(subtemplates).forEach(items => {
            allSubtemplates = allSubtemplates.concat(items);
        });

        // Filter subtemplates based on search
        const filteredSubtemplates = allSubtemplates.filter(item =>
            item.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Sort subtemplates by popularity and favorites
        filteredSubtemplates.sort((a, b) => {
            const aFavorite = favorites.includes(a);
            const bFavorite = favorites.includes(b);
            const aPopular = POPULAR_SUBTEMPLATES[template]?.includes(a);
            const bPopular = POPULAR_SUBTEMPLATES[template]?.includes(b);

            if (aFavorite && !bFavorite) return -1;
            if (!aFavorite && bFavorite) return 1;
            if (aPopular && !bPopular) return -1;
            if (!aPopular && bPopular) return 1;
            return 0;
        });

        // Generate HTML for each category
        const generateCategoryHTML = (category, items) => {
            const visibleItems = showingAllSubtemplates ? items : items.slice(0, 6);

            return `
                <div class="subtemplate-category mb-4">
                    <h5 class="mb-3">${category}</h5>
                    <div class="row g-3">
                        ${visibleItems.map(item => {
                            const isPopular = POPULAR_SUBTEMPLATES[template]?.includes(item);
                            const isFavorite = favorites.includes(item);
                            return `
                                <div class="col-md-6">
                                    <div class="subtemplate-item" data-subtemplate="${item}">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <span>${item}</span>
                                                ${isPopular ? '<span class="badge bg-primary ms-2">Popular</span>' : ''}
                                                ${isFavorite ? '<span class="badge bg-warning ms-2">Favorite</span>' : ''}
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <i class="fas fa-heart me-2 ${isFavorite ? 'text-danger' : 'text-muted'}"
                                                   onclick="event.stopPropagation(); toggleFavorite('${item}')"
                                                   style="cursor: pointer;"></i>
                                                <i class="fas fa-info-circle text-primary"
                                                   data-bs-toggle="tooltip"
                                                   data-bs-placement="top"
                                                   title="${SUBTEMPLATE_DESCRIPTIONS[item] || 'Description coming soon'}"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        };

        // Generate HTML for all categories
        let html = Object.entries(subtemplates)
            .map(([category, items]) => generateCategoryHTML(category, items))
            .join('');

        // Add "See More" button if there are hidden templates
        if (!showingAllSubtemplates && filteredSubtemplates.length > 6) {
            html += `
                <div class="text-center mt-4">
                    <button class="btn btn-outline-primary" id="seeMoreSubtemplates">
                        See More Subtemplates
                    </button>
                </div>
            `;
        }

        subtemplateContent.innerHTML = html;

        // Initialize tooltips for new content
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(el => new bootstrap.Tooltip(el));

        // Add click handlers for subtemplate items
        const subtemplateItems = document.querySelectorAll('.subtemplate-item');
        subtemplateItems.forEach(item => {
            item.addEventListener('click', () => {
                subtemplateItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                currentSubtemplate = item.dataset.subtemplate;
                selectedSubtemplateDisplay.textContent = currentSubtemplate;
                subtemplateModal.hide();
            });
        });

        // Add click handler for "See More" button
        const seeMoreBtn = document.getElementById('seeMoreSubtemplates');
        if (seeMoreBtn) {
            seeMoreBtn.addEventListener('click', () => {
                showingAllSubtemplates = true;
                updateSubtemplates(selectedTemplate, subtemplateSearchInput.value);
            });
        }
    }

    // Make toggleFavorite available globally
    window.toggleFavorite = toggleFavorite;


    // Update personalization form handler
    personalizationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const preferences = {
            grade: formData.get('defaultGrade'),
            duration: formData.get('defaultDuration'),
            teachingPreferences: formData.get('teachingPreferences')
        };
        localStorage.setItem('teacherPreferences', JSON.stringify(preferences));

        // Update form fields with saved preferences
        if (document.querySelector('[name="grade"]')) {
            document.querySelector('[name="grade"]').value = preferences.grade;
        }
        if (document.querySelector('[name="duration"]')) {
            document.querySelector('[name="duration"]').value = preferences.duration;
        }

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('personalizationModal')).hide();
    });

    // Add resource generation with quiz/worksheet generation
    async function generateResources(data) {
        try {
            const response = await fetch('/generate_resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Based on this lesson plan about "${data.title}", suggest relevant educational resources`,
                    subject: data.title,
                    grade: data.grade
                })
            });

            if (!response.ok) throw new Error('Failed to generate resources');

            const resources = await response.json();

            // Update resources in the UI
            const videoContainer = document.querySelector('.video-resources');
            const worksheetContainer = document.querySelector('.worksheet-resources');
            const materialsContainer = document.querySelector('.materials-resources');

            if (videoContainer) {
                videoContainer.innerHTML = resources.videos.map(video => `
                    <div class="resource-item">
                        <i class="fab fa-youtube text-danger me-2"></i>
                        <a href="${video.url}" target="_blank" class="text-decoration-none">
                            ${video.title}
                        </a>
                    </div>
                `).join('') || '<p class="text-muted">No videos found</p>';
            }

            if (worksheetContainer) {
                worksheetContainer.innerHTML = resources.worksheets.map(worksheet => `
                    <div class="resource-item">
                        <i class="fas fa-file-alt text-primary me-2"></i>
                        ${resources.has_quiz ? `
                            <a href="#" onclick="showQuiz(\`${worksheet.replace(/`/g, '\\`')}\`); return false;">
                                View Worksheet/Quiz
                            </a>
                        ` : worksheet}
                    </div>
                `).join('') || '<p class="text-muted">No worksheets found</p>';
            }

            if (materialsContainer) {
                materialsContainer.innerHTML = resources.materials.map(material => `
                    <div class="resource-item">
                        <i class="fas fa-shopping-cart text-success me-2"></i>
                        ${material}
                    </div>
                `).join('') || '<p class="text-muted">No materials found</p>';
            }
        } catch (error) {
            console.error('Error generating resources:', error);
            const containers = ['.video-resources', '.worksheet-resources', '.materials-resources'];
            containers.forEach(container => {
                const el = document.querySelector(container);
                if (el) {
                    el.innerHTML = '<p class="text-danger">Error loading resources</p>';
                }
            });
        }
    }

    // Quiz handling
    window.showQuiz = function(content) {
        const quizContent = document.getElementById('quizContent');
        quizContent.innerHTML = marked.parse(content);
        bootstrap.Modal.getInstance(document.getElementById('quizModal')).show();
    };

    // Update subtemplates based on selected template
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            templateCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTemplate = card.dataset.template;
            selectedTemplateDisplay.textContent = selectedTemplate;
            updateSubtemplates(selectedTemplate);
            templateModal.hide();
        });
    });

    // Handle subtemplate button click
    subtemplateButton.addEventListener('click', () => {
        subtemplateModal.show();
    });

    // Handle subtemplate search input
    subtemplateSearchInput.addEventListener('input', () => {
        updateSubtemplates(selectedTemplate, subtemplateSearchInput.value);
    });


    // ...rest of the original code...

});