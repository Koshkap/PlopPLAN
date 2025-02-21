document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    const templateModal = new bootstrap.Modal(document.getElementById('templateModal'), {
        backdrop: 'static'
    });
    const subtemplateModal = new bootstrap.Modal(document.getElementById('subtemplateModal'));
    templateModal.show();

    // Template variables
    let selectedTemplate = '';
    let currentSubtemplate = '';

    // DOM elements
    const templateCards = document.querySelectorAll('.template-card');
    const selectedTemplateDisplay = document.getElementById('selectedTemplate');
    const selectedSubtemplateDisplay = document.getElementById('selectedSubtemplate');
    const subtemplateButton = document.getElementById('subtemplateButton');
    const subtemplateContent = document.getElementById('subtemplateContent');
    const lessonForm = document.getElementById('lessonForm');
    const lessonOutput = document.getElementById('lessonPlanOutput');
    const changeTemplateBtn = document.getElementById('changeTemplate');
    const toggleAdvancedBtn = document.getElementById('toggleAdvanced');
    const advancedFields = document.getElementById('advancedFields');
    const sidebar = document.getElementById('historySidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');

    // Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Template selection
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            selectedTemplate = this.dataset.template;
            templateCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedTemplateDisplay.textContent = this.querySelector('h4').textContent;
            updateSubtemplates(selectedTemplate);

            document.getElementById('templateModal').dataset.bsBackdrop = 'true';
            templateModal.hide();
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

    // Update subtemplates based on selected template
    function updateSubtemplates(template) {
        const templatesData = JSON.parse(document.getElementById('templateModal').dataset.templates || '{}');
        const subtemplates = templatesData[template]?.subtemplates || {};

        subtemplateContent.innerHTML = Object.entries(subtemplates).map(([category, items]) => `
            <div class="subtemplate-category mb-4">
                <h5 class="mb-3">${category}</h5>
                <div class="row g-3">
                    ${items.map(item => `
                        <div class="col-md-6">
                            <div class="subtemplate-item" data-subtemplate="${item}">
                                ${item}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Add click handlers to subtemplate items
        document.querySelectorAll('.subtemplate-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.subtemplate-item').forEach(i => 
                    i.classList.remove('selected'));

                this.classList.add('selected');
                currentSubtemplate = this.dataset.subtemplate;
                selectedSubtemplateDisplay.textContent = currentSubtemplate;
                subtemplateModal.hide();
            });
        });
    }

    // Load history from localStorage
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
        }
    };


    // Toggle advanced options
    toggleAdvancedBtn.addEventListener('click', function() {
        const isHidden = advancedFields.classList.contains('d-none');
        advancedFields.classList.toggle('d-none');
        this.innerHTML = isHidden ?
            '<i class="fas fa-caret-up"></i> Show Less Options' :
            '<i class="fas fa-caret-down"></i> Show More Options';
    });

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
            grade: '',
            duration: '',
            objectives: ''
        };

        // Only add advanced fields if they're visible
        if (!advancedFields.classList.contains('d-none')) {
            formData.grade = this.elements.grade.value;
            formData.duration = this.elements.duration.value;
            formData.objectives = this.elements.objectives.value;
        }

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to generate plan. Please try again.');
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
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // Initial history load
    loadHistory();

    // Display lesson plan
    function displayLessonPlan(data) {
        if (!data.objectives || !Array.isArray(data.objectives)) {
            console.error('Invalid objectives data:', data.objectives);
            data.objectives = ['No objectives specified'];
        }

        const createSection = (title, content, summary) => `
            <div class="content-section">
                <div class="section-header" onclick="this.nextElementSibling.classList.toggle('expanded')">
                    <h4>${title}</h4>
                    <div class="section-summary">
                        ${Array.isArray(summary) ? summary.map(s => `<p>${s}</p>`).join('') : ''}
                    </div>
                </div>
                <div class="section-content">
                    ${content}
                </div>
            </div>
        `;

        const html = `
            <h2 class="mb-4">${data.title || 'Untitled Plan'}</h2>
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
        lessonOutput.classList.add('fade-in');
    }

    // Export functionality
    document.getElementById('exportPDF').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const content = lessonOutput.innerText;
        const splitContent = doc.splitTextToSize(content, 180);
        doc.text(splitContent, 15, 15);
        doc.save('lesson_plan.pdf');
    });

    document.getElementById('exportWord').addEventListener('click', function() {
        const content = lessonOutput.innerHTML;
        const blob = new Blob([`
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `], { type: 'application/msword' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'lesson_plan.doc';
        link.click();
    });
});