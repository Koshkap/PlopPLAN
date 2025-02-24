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
    "Quiz Quiz Trade": "A quick and engaging review activity."
};

// Define popular subtemplates with additional commonly used ones
const POPULAR_SUBTEMPLATES = [
    // Lesson Plans
    "5 E's Lesson Plan",
    "Student-Centered Approach",
    "Project Based Learning",
    "STEM Project",

    // Assessment
    "Multiple Choice Questions",
    "Word Problems",
    "Assessment Outline",
    "Evidence Statements",

    // Interactive
    "Think-Pair-Share",
    "Team Building Activity",
    "Jigsaw Activity",
    "Quiz Quiz Trade",

    // Content
    "Unit Plan",
    "Lab + Material List",
    "Technology Integration",
    "Book Summary"
];

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

    // Update subtemplates based on selected template
    function updateSubtemplates(template, searchQuery = '') {
        const subtemplates = templatesData[template]?.subtemplates || {};
        let allSubtemplates = [];
        let popularCount = 0;

        // Generate HTML for a category of subtemplates
        const generateCategoryHTML = (category, items, isPopular = false) => {
            // Filter items based on search query
            const filteredItems = items.filter(item =>
                item.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredItems.length === 0) return '';

            // Sort items by popularity
            filteredItems.sort((a, b) => {
                const aPopular = POPULAR_SUBTEMPLATES.includes(a);
                const bPopular = POPULAR_SUBTEMPLATES.includes(b);
                if (aPopular && !bPopular) return -1;
                if (!aPopular && bPopular) return 1;
                return 0;
            });

            return `
                <div class="subtemplate-category mb-4">
                    <h5 class="mb-3">${category}</h5>
                    <div class="row g-3">
                        ${filteredItems.map(item => {
                            const isPopular = POPULAR_SUBTEMPLATES.includes(item);
                            popularCount += isPopular ? 1 : 0;
                            if (!showingAllSubtemplates && !isPopular && popularCount > 6) return '';

                            return `
                                <div class="col-md-6">
                                    <div class="subtemplate-item" data-subtemplate="${item}">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <span>${item}</span>
                                                ${isPopular ? '<span class="badge bg-primary ms-2">Popular</span>' : ''}
                                            </div>
                                            <i class="fas fa-info-circle text-primary"
                                               data-bs-toggle="tooltip"
                                               data-bs-placement="top"
                                               title="${SUBTEMPLATE_DESCRIPTIONS[item] || 'Description coming soon'}"></i>
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
        let html = Object.entries(subtemplates).map(([category, items]) =>
            generateCategoryHTML(category, items)
        ).join('');

        // Add "See More" button if there are hidden templates
        if (!showingAllSubtemplates && popularCount > 6) {
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

    // Search functionality
    subtemplateSearchInput.addEventListener('input', (e) => {
        updateSubtemplates(selectedTemplate, e.target.value);
    });

    // Display lesson plan
    function displayLessonPlan(data) {
        if (!data.objectives || !Array.isArray(data.objectives)) {
            console.error('Invalid objectives data:', data.objectives);
            data.objectives = ['No objectives specified'];
        }

        const createSection = (title, content, summary) => `
            <div class="content-section">
                <div class="section-header" onclick="this.parentElement.querySelector('.section-content').classList.toggle('expanded')">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4>${title}</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="section-summary">
                        ${Array.isArray(summary) ? `<p>${summary[0]}</p>` : ''}
                    </div>
                </div>
                <div class="section-content">
                    ${content}
                </div>
            </div>
        `;

        const html = `
            <h3 class="mb-4">${data.title || 'Untitled Plan'}</h3>
            ${createSection('Overview',
                `<p>${data.overview || 'No overview provided'}</p>`,
                data.overview_summary)}
            ${createSection('Objectives',
                `<ul>${(data.objectives || []).map(obj => `<li>${obj}</li>`).join('')}</ul>`,
                data.objectives_summary)}
            ${createSection('Materials',
                `<ul>${(data.materials || []).map(mat => `<li>${mat}</li>`).join('')}</ul>`,
                data.materials_summary)}
            ${createSection('Procedure',
                `<ol>${(data.procedure || []).map(step => `<li>${step}</li>`).join('')}</ol>`,
                data.procedure_summary)}
            ${createSection('Assessment',
                `<p>${data.assessment || 'No assessment provided'}</p>`,
                data.assessment_summary)}
            ${createSection('Extensions',
                `<ul>${(data.extensions || []).map(ext => `<li>${ext}</li>`).join('')}</ul>`,
                data.extensions_summary)}
        `;

        lessonOutput.innerHTML = html;

        // Add resources section
        const resourcesTemplate = document.getElementById('resourcesTemplate').innerHTML;
        lessonOutput.insertAdjacentHTML('beforeend', resourcesTemplate);

        // Generate resources based on the lesson plan
        generateResources(data);
    }

    // Sidebar Toggle with button visibility
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarToggle.classList.add('hidden');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarToggle.classList.remove('hidden');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            sidebarToggle.classList.remove('hidden');
        }
    });

    // Template selection
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            selectedTemplate = card.dataset.template;
            templateCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTemplateDisplay.textContent = card.querySelector('h4').textContent;
            updateSubtemplates(selectedTemplate);

            // Force close the modal
            const modalInstance = bootstrap.Modal.getInstance(templateModalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    });

    // Change template button
    changeTemplateBtn.addEventListener('click', () => {
        templateModal.show();
    });

    // Show subtemplate modal
    subtemplateButton.addEventListener('click', () => {
        subtemplateModal.show();
    });


    // Toggle arrow rotation
    document.querySelector('.card-title').addEventListener('click', function() {
        const arrow = this.querySelector('.fa-chevron-down');
        const output = document.getElementById('lessonPlanOutput');

        if (output.style.display === 'none') {
            output.style.display = 'block';
            arrow.style.transform = 'rotate(0deg)';
        } else {
            output.style.display = 'none';
            arrow.style.transform = 'rotate(-90deg)';
        }
    });

    const loadHistory = () => {
        const history = JSON.parse(localStorage.getItem('lessonHistory') || '[]');
        const historyContainer = document.getElementById('lessonHistory');
        historyContainer.innerHTML = history.map((item, index) => `
            <div class="list-group-item list-group-item-action" role="button" onclick="loadLessonPlan(${index})">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-1">${item.title}</h5>
                    <small>${new Date(item.timestamp).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">${item.subject} - ${item.grade || 'No grade specified'}</p>
            </div>
        `).join('') || '<p class="text-muted p-3">No plans yet</p>';
    };

    // Save to history
    const saveToHistory = (lessonPlan, formData) => {
        const history = JSON.parse(localStorage.getItem('lessonHistory') || '[]');
        history.unshift({
            ...lessonPlan,
            ...formData,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('lessonHistory', JSON.stringify(history.slice(0, 10)));
        loadHistory();
    };

    // Load a lesson plan from history
    window.loadLessonPlan = (index) => {
        const history = JSON.parse(localStorage.getItem('lessonHistory') || '[]');
        if (history[index]) {
            const plan = history[index];
            displayLessonPlan(plan);
            sidebar.classList.remove('active');
            sidebarToggle.classList.remove('hidden');
        }
    };


    // Form submission
    lessonForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!selectedTemplate) {
            alert('Please select a template first');
            templateModal.show();
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const spinner = submitBtn.querySelector('.spinner-border');
        const originalBtnText = submitBtn.textContent;

        // Show loading state
        submitBtn.disabled = true;
        spinner.classList.remove('d-none');
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status"></span>
            Generating...
        `;

        // Show loading in output area
        lessonOutput.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <p class="text-muted">Generating your plan...</p>
            </div>
        `;

        const formData = {
            template: selectedTemplate,
            subtemplate: currentSubtemplate,
            subject: this.elements.subject.value,
            grade: this.elements.grade?.value || '',
            duration: this.elements.duration?.value || '',
            objectives: this.elements.objectives?.value || ''
        };

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to generate plan');
            }

            const data = await response.json();
            displayLessonPlan(data);
            saveToHistory(data, formData);

        } catch (error) {
            lessonOutput.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    Error: ${error.message}
                </div>
            `;
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            submitBtn.textContent = originalBtnText;
        }
    });

    // Initial history load
    loadHistory();

    // Add personalization handling
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
        document.querySelector('[name="grade"]').value = preferences.grade;
        document.querySelector('[name="duration"]').value = preferences.duration;

        // Close modal using Bootstrap's modal instance
        const personalizationModal = bootstrap.Modal.getInstance(document.getElementById('personalizationModal'));
        personalizationModal.hide();
    });

    // Load saved preferences on page load
    const loadSavedPreferences = () => {
        const preferences = JSON.parse(localStorage.getItem('teacherPreferences') || '{}');
        if (preferences.grade) {
            document.querySelector('[name="grade"]').value = preferences.grade;
        }
        if (preferences.duration) {
            document.querySelector('[name="duration"]').value = preferences.duration;
        }
    };

    // Call loadSavedPreferences on page load
    loadSavedPreferences();

    // Export functionality
    document.getElementById('exportPDF').addEventListener('click', async function() {
        const content = document.getElementById('lessonPlanOutput');

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.body.appendChild(script);

        script.onload = function() {
            const opt = {
                margin: 1,
                filename: 'lesson_plan.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(content).save();
        };
    });

    document.getElementById('exportWord').addEventListener('click', function() {
        const content = document.getElementById('lessonPlanOutput');
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset="utf-8">
                    <title>Lesson Plan</title>
                    <style>
                        body { font-family: Calibri, sans-serif; }
                        .section-header { font-size: 16pt; color: #1a73e8; margin-top: 20pt; }
                        .section-content { margin-left: 20pt; }
                    </style>
                </head>
                <body>
        `;
        const footer = '</body></html>';
        const sourceHTML = header + content.innerHTML + footer;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = 'lesson_plan.doc';
        fileDownload.click();
        document.body.removeChild(fileDownload);
    });

    // Add resource generation with web scraping
    async function generateResources(data) {
        const prompt = `Based on this lesson plan about "${data.title}", suggest:
        1. Three relevant educational YouTube videos (titles only)
        2. Three worksheet ideas
        3. Three recommended teaching materials from Amazon
        Keep suggestions concise and directly related to the lesson content.`;

        try {
            const response = await fetch('/generate_resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
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

            videoContainer.innerHTML = resources.videos.map(video => `
                <div class="resource-item">
                    <i class="fab fa-youtube text-danger me-2"></i>
                    <a href="${video.url}" target="_blank" class="text-decoration-none">
                        ${video.title}
                    </a>
                </div>
            `).join('');

            worksheetContainer.innerHTML = resources.worksheets.map(worksheet => `
                <div class="resource-item">
                    <i class="fas fa-file-download text-primary me-2"></i>
                    ${resources.has_quiz ? `
                        <a href="#" onclick="showQuiz(\`${worksheet.replace(/`/g, '\\`')}\`); return false;">
                            View Quiz/Worksheet
                        </a>
                    ` : worksheet}
                </div>
            `).join('');

            materialsContainer.innerHTML = resources.materials.map(material => `
                <div class="resource-item">
                    <i class="fas fa-shopping-cart text-success me-2"></i>
                    <a href="${material.url}" target="_blank" class="text-decoration-none">
                        ${material.title} - ${material.price}
                    </a>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error generating resources:', error);
        }
    }

    // Quiz/Worksheet handling
    function showQuiz(content) {
        const quizContent = document.getElementById('quizContent');
        quizContent.innerHTML = marked.parse(content);
        quizModal.show();
    }

    // Export quiz functionality
    document.getElementById('exportQuizWord').addEventListener('click', function() {
        const content = document.getElementById('quizContent');
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset="utf-8"><title>Quiz/Worksheet</title></head>
                <body>
        `;
        const footer = '</body></html>';
        const sourceHTML = header + content.innerHTML + footer;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = 'quiz_worksheet.doc';
        fileDownload.click();
        document.body.removeChild(fileDownload);
    });

    document.getElementById('exportQuizPDF').addEventListener('click', function() {
        const content = document.getElementById('quizContent');
        const opt = {
            margin: 1,
            filename: 'quiz_worksheet.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(content).save();
    });
});