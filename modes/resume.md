# Mode: resume — One-Page LaTeX Resume (Students & New Grads)

## Who this is for

Students, interns, and new grads (0–3 years of experience). Hard one-page constraint.
Uses Jake's Resume LaTeX template. No professional summary. No competency tag pills.
Education comes first. Skills are formatted by career track.

For experienced candidates (3+ years), use `/career-ops pdf` instead.

---

## Full Pipeline

### Step 1 — Load context

Read in order:
1. `cv.md` — canonical CV content
2. `config/profile.yml` — candidate identity, career_track, GPA setting
3. `modes/_profile.md` — user archetypes and narrative overrides

Extract from `profile.yml`:
- `candidate.full_name`, `candidate.email`, `candidate.phone`, `candidate.location`
- `candidate.linkedin`, `candidate.github`
- `resume.career_track` (default: `cs` if missing)
- `resume.include_gpa` (default: `auto` — include if GPA ≥ 3.5)

### Step 2 — Get the JD

If no JD is in context, ask:
> "Paste the job description or URL so I can tailor the resume."

If a URL is provided, use WebFetch to extract it. Extract 10–15 keywords from the JD.
Detect JD language. Detect company location → paper format (US/CA = letter, rest = a4).

### Step 3 — Generate content (no summary, ever)

#### Header

Build the header fields:
- `{{NAME}}` — from `profile.yml`
- `{{EMAIL}}` — from `profile.yml`
- `{{PHONE_FIELD}}` — if phone exists in profile: `\small PHONE $|$ ` (with trailing space and pipe), else empty string
- `{{LINKEDIN_URL}}` / `{{LINKEDIN_DISPLAY}}` — from `profile.yml`. Strip `https://` from display.
- `{{GITHUB_URL}}` / `{{GITHUB_DISPLAY}}` — from `profile.yml`. Strip `https://` from display.
- `{{LOCATION_FIELD}}` — if location exists: ` $|$ LOCATION`, else empty string

#### Education

Format each degree as a `\resumeSubheading`:

```latex
\resumeSubheading
  {University Name}{City, State (or Country)}
  {Degree — Major}{Month Year (Expected or graduated)}
```

Include GPA line if:
- `resume.include_gpa: true` in profile.yml, OR
- `resume.include_gpa: auto` (default) AND GPA ≥ 3.5

GPA line goes as a bullet under the subheading:
```latex
\resumeItemListStart
  \resumeItem{GPA: X.XX/4.0}
  \resumeItem{Relevant Coursework: Course A, Course B, Course C}  % only if JD-relevant
\resumeItemListEnd
```

Relevant coursework: include only when courses directly match JD requirements (e.g., JD asks for ML → include ML course). Max 4–5 courses.

#### Experience

Only include: internships, co-ops, part-time roles, research positions, teaching assistantships.
Reverse chronological order.

For each role:
```latex
\resumeSubheading
  {Company Name}{City, State (Remote)}
  {Job Title}{Month Year -- Month Year}
\resumeItemListStart
  \resumeItem{Strong action verb + what you did + measurable result.}
  \resumeItem{...}
\resumeItemListEnd
```

**Bullet rules:**
- Max 3 bullets per role (2 if tight on space)
- Each bullet: action verb + task/method + metric or outcome
- Use X-Y-Z formula where possible: "Accomplished [X] as measured by [Y] by doing [Z]"
- Inject JD keywords naturally — never invent experience
- No passive voice. No "I". No period at bullet end is fine but be consistent.

If no work experience exists in cv.md, omit the Experience section entirely.
The `{{EXPERIENCE_SECTION}}` placeholder outputs the full section block OR empty string.

```latex
% When experience exists:
\section{Experience}
  \resumeSubHeadingListStart
    {{EXPERIENCE_ENTRIES}}
  \resumeSubHeadingListEnd

% When no experience: output nothing
```

#### Projects

Select 2–3 projects most relevant to the JD. Prefer projects with measurable outcomes or live links.

```latex
\resumeProjectHeading
  {\textbf{Project Name} $|$ \emph{Tech, Stack, Here}}{Month Year}
\resumeItemListStart
  \resumeItem{What it does + impact/scale + JD-relevant keyword.}
  \resumeItem{Optional second bullet if space allows.}
\resumeItemListEnd
```

**Project rules:**
- Always list tech stack in the heading line (after `$|$`)
- 1–2 bullets per project (never 3 — projects are secondary to experience)
- Lead with what it does, not how you built it
- If project has a live URL or GitHub link, hyperlink the project name:
  `\href{URL}{\textbf{Project Name}}`

#### Skills

Format based on `resume.career_track` from `profile.yml`. Pull actual skills from `cv.md` — these are category labels, not fixed lists. Fill each category from what the candidate actually knows.

**`cs` — Computer Science / Software Engineering:**
```latex
\textbf{Languages}{: Python, Java, C++, ...} \\
\textbf{Frameworks}{: React, FastAPI, Spring Boot, ...} \\
\textbf{Developer Tools}{: Git, Docker, AWS, Linux, ...} \\
\textbf{Databases}{: PostgreSQL, MongoDB, Redis, ...}
```

**`ds` — Data Science / Machine Learning:**
```latex
\textbf{Languages}{: Python, R, SQL, ...} \\
\textbf{ML Libraries}{: PyTorch, scikit-learn, HuggingFace, ...} \\
\textbf{Data Tools}{: pandas, Spark, Airflow, dbt, ...} \\
\textbf{Platforms}{: AWS SageMaker, Databricks, MLflow, ...}
```

**`eng` — Engineering (Mechanical / Electrical / Civil / Chemical):**
```latex
\textbf{Software}{: MATLAB, AutoCAD, SolidWorks, ANSYS, ...} \\
\textbf{Programming}{: Python, C/C++, VHDL, LabVIEW, ...} \\
\textbf{Technical Skills}{: FEA, PCB Design, Signal Processing, ...} \\
\textbf{Tools}{: Git, LaTeX, Microsoft Office}
```

**`general` — Non-technical / General:**
```latex
\textbf{Software}{: Microsoft Office Suite, Google Workspace, Salesforce, ...} \\
\textbf{Technical Skills}{: Data Analysis, Project Management, Technical Writing, ...} \\
\textbf{Languages}{: English (Native), French (Professional), ...}
```

If `career_track` is missing or unrecognized, default to `cs`.

---

## Step 4 — Judge: One-Page Enforcement

After generating all content, estimate whether it fits one page before writing the file.

**Line budget for letter paper (11pt, 0.5in margins, Jake's template):** ~55–60 content lines.

Count approximate lines:
- Header: 2 lines
- Education section header: 1 line
- Each degree: 3 lines base + 1 per bullet (GPA, coursework)
- Experience section header: 1 line (0 if omitted)
- Each role: 3 lines base + 1 per bullet
- Projects section header: 1 line
- Each project: 2 lines base + 1 per bullet
- Skills section header: 1 line
- Skills content: 1 per category line

**If estimated total > 58 lines, apply trims in this order:**
1. Reduce experience bullets to 2 per role (save ~1 line per role)
2. Reduce projects to 2 (drop least relevant)
3. Drop relevant coursework from Education
4. Reduce project bullets to 1 each
5. If still over: warn the user and ask what to cut before proceeding

**If experience section was omitted:** projects budget increases to 3 projects × 2 bullets.

After trimming, re-estimate. Proceed only when within budget.

---

## Step 5 — Fill and compile

1. Read `templates/cv-template.tex`
2. Replace all `{{PLACEHOLDER}}` values with generated content
3. **LaTeX escaping (MANDATORY):** Escape these characters in ALL user-supplied text before inserting:
   - `&` → `\&`
   - `%` → `\%`
   - `$` → `\$`
   - `#` → `\#`
   - `_` → `\_`
   - `{` → `\{`
   - `}` → `\}`
   - `~` → `\textasciitilde{}`
   - `^` → `\textasciicircum{}`
   - `\` → `\textbackslash{}`
   - Smart quotes / em-dashes → ASCII equivalents (`"`, `'`, `-`)
   - Exception: do NOT escape LaTeX commands you generate (e.g., `\textbf{}`, `\resumeItem`)
4. Derive candidate slug: `profile.yml` → `full_name` → kebab-case lowercase (e.g. "Jane Smith" → "jane-smith")
5. Derive company slug: from JD company name → kebab-case lowercase
6. Write filled `.tex` to `/tmp/resume-{{candidate}}-{{company}}.tex`
7. Run:
   ```bash
   node generate-latex.mjs /tmp/resume-{{candidate}}-{{company}}.tex output/resume-{{candidate}}-{{company}}-{{YYYY-MM-DD}}.pdf
   ```
8. Check exit code:
   - `0` = success, one page
   - `2` = compiled but over one page → go back to Step 4, apply next trim
   - `1` = compilation error → show the LaTeX error to the user

---

## Step 6 — Post-generation

Report to the user:
- PDF path
- Page count
- Which JD keywords were injected (and where)
- Any content that was trimmed to fit one page

Update tracker if the offer is already registered: change PDF column from ❌ to ✅.

---

## ATS Rules

- Single-column layout — no sidebars
- Standard section headers (Education, Experience, Projects, Technical Skills)
- No text in images
- UTF-8, selectable text (pdflatex produces this natively)
- No tables inside bullet content
- Hyperlinks embedded for email, LinkedIn, GitHub, project URLs

---

## No Summary — Always

Never generate a Professional Summary section. The header, first experience bullet, and first project bullet carry all the signal a recruiter needs in the 6-second scan. A summary wastes the most valuable real estate on the page.
