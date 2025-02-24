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
                "STEM Project"
            ],
            "Interactive Activities": [
                "Think-Pair-Share",
                "Team Building Activity",
                "Jigsaw Activity",
                "Quiz Quiz Trade"
            ],
            "Assessment Tools": [
                "Multiple Choice Questions",
                "Word Problems",
                "Assessment Outline",
                "Evidence Statements"
            ],
            "Learning Tools": [
                "Unit Plan",
                "Lab + Material List",
                "Technology Integration",
                "Book Summary"
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
                "True/False Questions"
            ],
            "Evaluation Tools": [
                "Analytic Rubric",
                "Holistic Rubric",
                "Assessment Outline",
                "Evidence Statements"
            ],
            "Assignments": [
                "Complex Learning Activity",
                "Portfolio Assignment",
                "Research Project",
                "Problem Set"
            ],
            "Assessment Methods": [
                "Exit Slip",
                "Journal Log",
                "Oral Exam",
                "Project-Based Assessment"
            ]
        }
    },
    "feedback": {
        "description": "Design engaging activities and feedback mechanisms",
        "subtemplates": {
            "Interactive Activities": [
                "Think-Pair-Share",
                "Jigsaw Activity",
                "Round Robin",
                "4 Corners"
            ],
            "Learning Games": [
                "Bingo Style",
                "Jeopardy Style",
                "Quiz Quiz Trade",
                "Escape Room"
            ],
            "Engagement Tools": [
                "Class Poll",
                "Self-Assessment",
                "Reflective Journaling",
                "Mad Lib"
            ],
            "Social Learning": [
                "Team Building Activity",
                "S.E.L. Activity",
                "Mindfulness Activity",
                "Conversation Practice"
            ]
        }
    },
    "admin": {
        "description": "Create administrative documents and communication materials",
        "subtemplates": {
            "Planning": [
                "Syllabus Starter",
                "Substitute Planner",
                "Action Steps",
                "IEP Outline"
            ],
            "Communication": [
                "Parent Communication",
                "Class Announcement",
                "Newsletter Outline",
                "Email Outline"
            ],
            "Documentation": [
                "Student Update",
                "Report Card Comments",
                "Evidence-Based Intervention",
                "Behavioral Intervention Plan"
            ],
            "Professional": [
                "Letter of Recommendation",
                "Observation Suggestions",
                "S.M.A.R.T. Goal Outline",
                "School Improvement Project"
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