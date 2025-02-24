import os
import json
from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import urllib.parse
import trafilatura
import re

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

LESSON_TEMPLATES = {
    "lesson": {
        "description": "Create comprehensive lesson plans with clear objectives, activities, and methods",
        "subtemplates": {
            "Core Lesson Plans": [
                "5 E's Lesson Plan",
                "Student-Centered Approach", 
                "Project Based Learning",
                "Differentiated Instruction",
                "STEM Project",
                "Flipped Classroom",
                "Inquiry-Based Learning",
                "Direct Instruction"
            ],
            "Interactive Activities": [
                "Think-Pair-Share",
                "Team Building Activity",
                "Jigsaw Activity",
                "Group Discussion",
                "Role Playing",
                "Hands-On Learning",
                "Peer Teaching"
            ],
            "Learning Tools": [
                "Unit Plan",
                "Lab + Material List",
                "Technology Integration",
                "Book Summary",
                "Learning Stations",
                "Visual Aids",
                "Interactive Notebook"
            ]
        }
    },
    "assessment": {
        "description": "Generate assessment materials, rubrics, and evaluation tools",
        "subtemplates": {
            "Question Types": [
                "Multiple Choice Questions",
                "Word Problems",
                "Fill In The Blank",
                "True/False Questions",
                "Short Answer",
                "Open-Ended Questions",
                "Problem Solving"
            ],
            "Evaluation Tools": [
                "Analytic Rubric",
                "Holistic Rubric",
                "Assessment Outline",
                "Evidence Statements",
                "Grading Matrix",
                "Performance Checklist",
                "Portfolio Review"
            ],
            "Assessment Methods": [
                "Exit Slip",
                "Journal Log",
                "Oral Exam",
                "Project-Based Assessment",
                "Peer Assessment",
                "Self-Assessment",
                "Progress Check"
            ]
        }
    },
    "feedback": {
        "description": "Design engaging activities and feedback mechanisms",
        "subtemplates": {
            "Interactive Activities": [
                "Class Poll",
                "Quick Check",
                "Discussion Guide",
                "Response Cards",
                "Think-Write-Share",
                "Gallery Walk",
                "Four Corners"
            ],
            "Learning Games": [
                "Bingo Style",
                "Jeopardy Style",
                "Quiz Quiz Trade",
                "Escape Room",
                "Memory Match",
                "Scavenger Hunt",
                "Review Race"
            ],
            "Reflection Tools": [
                "Self-Assessment",
                "Reflective Journaling",
                "Mad Lib",
                "Goal Setting",
                "Progress Tracking",
                "Learning Diary",
                "Feedback Form"
            ]
        }
    },
    "admin": {
        "description": "Create administrative documents and communication materials",
        "subtemplates": {
            "Planning": [
                "Syllabus Template",
                "Substitute Plan",
                "Action Steps",
                "IEP Outline",
                "Curriculum Map",
                "Term Planning",
                "Meeting Agenda"
            ],
            "Communication": [
                "Parent Letter",
                "Class Announcement",
                "Newsletter Template",
                "Email Template",
                "Progress Report",
                "Conference Guide",
                "Event Planning"
            ],
            "Documentation": [
                "Student Update",
                "Report Card Comments",
                "Intervention Plan",
                "Behavior Log",
                "Accommodation List",
                "Meeting Notes",
                "Resource List"
            ]
        }
    }
}

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/app')
def index():
    return render_template('index.html', templates=LESSON_TEMPLATES)

@app.route('/generate', methods=['POST'])
def generate_lesson():
    try:
        data = request.json
        template_type = data.get('template')
        subject = data.get('subject')
        grade = data.get('grade', '')
        duration = data.get('duration', '')
        objectives = data.get('objectives', '')
        subtemplate = data.get('subtemplate', '')

        prompt = f"""
        Create a detailed educational plan using the following parameters:
        Template Type: {LESSON_TEMPLATES[template_type]['description']}
        {"Subtemplate: " + subtemplate if subtemplate else ""}
        Subject: {subject}
        {"Grade Level: " + grade if grade else ""}
        {"Duration: " + duration if duration else ""}
        {"Objectives: " + objectives if objectives else ""}

        Please provide the plan in JSON format with the following structure:
        {{
            "title": "Title",
            "overview": "Brief overview",
            "overview_summary": ["Summary sentence 1", "Summary sentence 2"],
            "objectives": ["objective1", "objective2"],
            "objectives_summary": ["Summary sentence 1", "Summary sentence 2"],
            "materials": ["material1", "material2"],
            "materials_summary": ["Summary sentence 1", "Summary sentence 2"],
            "procedure": ["step1", "step2"],
            "procedure_summary": ["Summary sentence 1", "Summary sentence 2"],
            "assessment": "Assessment details",
            "assessment_summary": ["Summary sentence 1", "Summary sentence 2"],
            "extensions": ["extension1", "extension2"],
            "extensions_summary": ["Summary sentence 1", "Summary sentence 2"]
        }}
        """

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        return jsonify(json.loads(response.choices[0].message.content))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate_resources', methods=['POST'])
def generate_resources():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        subject = data.get('subject', '')
        grade = data.get('grade', '')

        # Generate initial suggestions using OpenAI
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": f"{prompt}\nRespond in JSON format with arrays: 'videos', 'worksheets', 'materials'"
            }],
            response_format={"type": "json_object"}
        )

        suggestions = json.loads(response.choices[0].message.content)

        # Search YouTube for relevant videos
        youtube_search_query = f"education {subject} {grade} lesson"
        youtube_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(youtube_search_query)}"
        downloaded = trafilatura.fetch_url(youtube_url)

        if downloaded:
            youtube_content = downloaded.decode('utf-8')
            video_pattern = r'videoRenderer":{"videoId":"([^"]+)","thumbnail":.*?"title":{"runs":\[{"text":"([^"]+)"\}\]'
            videos = []
            for match in re.finditer(video_pattern, youtube_content):
                if len(videos) < 3:  # Limit to 3 videos
                    video_id, title = match.groups()
                    if all(word.lower() not in title.lower() for word in ['#shorts', '#tiktok']):
                        videos.append({
                            "title": title,
                            "url": f"https://www.youtube.com/watch?v={video_id}"
                        })
        else:
            videos = suggestions.get('videos', [])

        # For worksheets, we'll use the OpenAI suggestions
        worksheets = suggestions.get('worksheets', [])

        # Generate quiz or worksheet content if needed
        if any(keyword in subject.lower() for keyword in ['quiz', 'test', 'assessment', 'worksheet']):
            quiz_response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[{
                    "role": "user",
                    "content": f"Create a {subject} for grade {grade} with 10 questions. Include answer key. Format in markdown."
                }]
            )
            worksheets = [quiz_response.choices[0].message.content]

        # Search for educational materials on Amazon
        materials = suggestions.get('materials', [])  # Fallback to suggestions

        return jsonify({
            "videos": videos,
            "worksheets": worksheets,
            "materials": materials,
            "has_quiz": any(keyword in subject.lower() for keyword in ['quiz', 'test', 'assessment', 'worksheet'])
        })
    except Exception as e:
        print(f"Error generating resources: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)