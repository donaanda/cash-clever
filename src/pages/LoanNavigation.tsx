import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

/**
 * LoanNavigationPanel (Tailwind CSS)
 * -----------------------------------------------------------------------
 * Recreates the mortgage-application navigation control shown in the
 * reference screenshot:
 *  - A single combined dropdown for navigation: opening it lists every
 *    section with its full list of questions nested directly beneath —
 *    all sections and questions are visible at once (no accordion /
 *    expand-collapse state, no divider line under a section). Clicking
 *    a question jumps straight to it, switching section if needed.
 *    Questions are styled by state:
 *      - not yet answered  -> muted grey
 *      - answered          -> solid dark text
 *      - currently open    -> blue highlight
 *  - Prev / next arrows next to the dropdown step through sections.
 *  - A single-line progress bar that reflects progress across every
 *    question in every visible section (flattened), not just section
 *    position — each question is one increment of the bar.
 *  - Below the bar, the currently selected question is shown as an
 *    actual input field the person can fill in (section label above
 *    it, question label as the field's label). A "Continue" button
 *    always advances to the next question overall — it's only disabled
 *    on the very last question, where there's nowhere left to go.
 *    Typing a non-empty answer still marks that question as answered
 *    for the dropdown/progress-bar styling, but isn't required to
 *    move forward.
 *  - The "Co-borrower" section only appears in the flow when the person
 *    has indicated (via the toggle at the bottom) that they have one.
 * -----------------------------------------------------------------------
 */

const BASE_SECTIONS = [
  {
    id: "personal-info",
    label: "Personal info",
    questions: [
      { id: "pi-veteran", label: "Veteran status", answered: true },
      { id: "pi-birthday", label: "Birthday", answered: true },
      { id: "pi-address", label: "Address", answered: false },
      { id: "pi-employment", label: "Employment", answered: false },
      { id: "pi-job-duration", label: "Job duration", answered: false },
      { id: "pi-salary", label: "Salary", answered: false },
      { id: "pi-credit", label: "Credit", answered: false },
    ],
  },
  {
    id: "co-borrower",
    label: "Co-borrower",
    conditional: true,
    questions: [
      { id: "cb-name", label: "Legal name", answered: false },
      { id: "cb-dob", label: "Date of birth", answered: false },
      { id: "cb-relationship", label: "Relationship to borrower", answered: false },
    ],
  },
  {
    id: "car-house-details",
    label: "Car / house details",
    questions: [
      { id: "cd-make-model", label: "Make and model", answered: false },
      { id: "cd-year", label: "Vehicle year", answered: false },
      { id: "cd-value", label: "Vehicle value", answered: false },
      { id: "hd-property-type", label: "Property type", answered: false },
      { id: "hd-price", label: "Purchase price", answered: false },
      { id: "hd-occupancy", label: "Occupancy", answered: false },
    ],
  },
  {
    id: "loan-calc",
    label: "Loan / mortgage calculation",
    questions: [
      { id: "lc-price", label: "Purchase price", answered: false },
      { id: "lc-down", label: "Down payment", answered: false },
      { id: "lc-term", label: "Loan term", answered: false },
    ],
  },
];

const LoanNavigation = () => {
  const [hasCoBorrower, setHasCoBorrower] = useState(true);
  const [activeQuestionId, setActiveQuestionId] = useState("pi-address");
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const sectionMenuRef = useRef(null);
  const [answeredMap, setAnsweredMap] = useState(() => {
    const map = {};
    BASE_SECTIONS.forEach((s) =>
      s.questions.forEach((q) => (map[q.id] = q.answered))
    );
    return map;
  });
  const [answerValues, setAnswerValues] = useState({});

  const sections = useMemo(
    () => BASE_SECTIONS.filter((s) => !s.conditional || hasCoBorrower),
    [hasCoBorrower]
  );

  const activeSectionIndex = useMemo(() => {
    const idx = sections.findIndex((s) =>
      s.questions.some((q) => q.id === activeQuestionId)
    );
    return idx === -1 ? 0 : idx;
  }, [sections, activeQuestionId]);

  const [sectionIndex, setSectionIndex] = useState(activeSectionIndex);
  const currentSection = sections[sectionIndex] ?? sections[0];
  const currentQuestion =
    currentSection?.questions.find((q) => q.id === activeQuestionId) ??
    currentSection?.questions[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (sectionMenuRef.current && !sectionMenuRef.current.contains(e.target)) {
        setSectionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentSection) return;
    const stillValid = currentSection.questions.some(
      (q) => q.id === activeQuestionId
    );
    if (!stillValid) {
      setActiveQuestionId(currentSection.questions[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIndex]);

  const allQuestions = useMemo(
    () => sections.flatMap((s) => s.questions),
    [sections]
  );

  const activeQuestionOverallIndex = useMemo(() => {
    const idx = allQuestions.findIndex((q) => q.id === activeQuestionId);
    return idx === -1 ? 0 : idx;
  }, [allQuestions, activeQuestionId]);

  const goPrev = () => setSectionIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setSectionIndex((i) => Math.min(sections.length - 1, i + 1));

  const goToSection = (idx) => {
    setSectionIndex(idx);
  };

  const selectQuestion = (qId, sectionIdx) => {
    setSectionIndex(sectionIdx);
    setActiveQuestionId(qId);
    setSectionMenuOpen(false);
  };

  const handleAnswerChange = (qId, value) => {
    setAnswerValues((prev) => ({ ...prev, [qId]: value }));
    setAnsweredMap((prev) => ({ ...prev, [qId]: value.trim().length > 0 }));
  };

  const goToNextQuestion = () => {
    const nextOverallIndex = Math.min(
      allQuestions.length - 1,
      activeQuestionOverallIndex + 1
    );
    const nextQuestion = allQuestions[nextOverallIndex];
    if (!nextQuestion) return;
    const nextSectionIdx = sections.findIndex((s) =>
      s.questions.some((q) => q.id === nextQuestion.id)
    );
    setSectionIndex(nextSectionIdx === -1 ? sectionIndex : nextSectionIdx);
    setActiveQuestionId(nextQuestion.id);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-12">
      <div className="w-full max-w-sm">
        <span className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2.5">
          Navigation
        </span>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md shadow-slate-900/5 px-4 pt-4 pb-3">
          {/* Section carousel + dropdown */}
          <div className="flex items-center justify-between mb-2.5">
            <button
              className={`flex items-center justify-center w-[30px] h-[30px] rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors ${
                sectionIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
              }`}
              onClick={goPrev}
              disabled={sectionIndex === 0}
              aria-label="Previous section"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="relative flex-1" ref={sectionMenuRef}>
              <button
                className="w-full flex items-center justify-center gap-1.5 text-[15px] font-bold text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => setSectionMenuOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={sectionMenuOpen}
              >
                {currentSection.label}
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform ${
                    sectionMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {sectionMenuOpen && (
                <ul
                  role="listbox"
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-64 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 p-1.5 z-10"
                >
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <button
                        role="option"
                        aria-selected={i === sectionIndex}
                        className="w-full text-left text-sm px-2.5 py-1.5 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        onClick={() => goToSection(i)}
                      >
                        {s.label}
                      </button>

                      <ul className="mt-0.5 mb-1 pl-3 ml-2.5">
                        {s.questions.map((q) => {
                          const isActive = q.id === activeQuestionId;
                          const isAnswered = answeredMap[q.id];
                          return (
                            <li key={q.id}>
                              <button
                                role="option"
                                aria-selected={isActive}
                                className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                                  isActive
                                    ? "text-slate-900 bg-blue-50 font-semibold"
                                    : isAnswered
                                    ? "text-slate-700 font-medium hover:bg-slate-50"
                                    : "text-slate-300 hover:bg-slate-50"
                                }`}
                                onClick={() => selectQuestion(q.id, i)}
                              >
                                {q.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className={`flex items-center justify-center w-[30px] h-[30px] rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors ${
                sectionIndex === sections.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : ""
              }`}
              onClick={goNext}
              disabled={sectionIndex === sections.length - 1}
              aria-label="Next section"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Progress rail */}
          <div className="w-full h-[3px] bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((activeQuestionOverallIndex + 1) / allQuestions.length) * 100
                }%`,
              }}
            />
          </div>

          {/* Currently selected question — must be answered to progress */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="block text-xs font-medium text-slate-400 mb-1">
              {currentSection.label}
            </span>
            <label
              htmlFor="current-question-input"
              className="block text-base font-semibold text-slate-900 mb-2"
            >
              {currentQuestion?.label}
            </label>
            <input
              id="current-question-input"
              type="text"
              value={answerValues[currentQuestion?.id] ?? ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion?.id, e.target.value)
              }
              placeholder="Type your answer"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={goToNextQuestion}
              disabled={activeQuestionOverallIndex === allQuestions.length - 1}
              className="mt-3 w-full text-sm font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              {activeQuestionOverallIndex === allQuestions.length - 1
                ? "Last question"
                : "Continue"}
            </button>
          </div>
        </div>

        {/* Co-borrower toggle — controls whether that section appears */}
        <div className="mt-4 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
          <span className="text-sm text-slate-600">
            Applying with a co-borrower?
          </span>
          <div className="flex gap-1.5">
            <button
              className={`text-sm px-3 py-1 rounded-md border transition-colors ${
                hasCoBorrower
                  ? "bg-blue-600 border-blue-600 text-white font-semibold"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
              onClick={() => setHasCoBorrower(true)}
            >
              Yes
            </button>
            <button
              className={`text-sm px-3 py-1 rounded-md border transition-colors ${
                !hasCoBorrower
                  ? "bg-blue-600 border-blue-600 text-white font-semibold"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
              onClick={() => {
                setHasCoBorrower(false);
                if (sectionIndex >= sections.length - 1) {
                  setSectionIndex(0);
                }
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanNavigation;