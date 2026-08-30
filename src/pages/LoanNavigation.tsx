import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";


const SECTIONS = [
  {
    sectionId: "personal-info",
    sectionLabel: "Personal info",
    questionId: "pi-veteran",
    questionLabel: "Veteran status",
    conditional: false,
  },
  {
    sectionId: "personal-info",
    sectionLabel: "Personal info",
    questionId: "pi-birthday",
    questionLabel: "Birthday",
    conditional: false,
  },
  {
    sectionId: "personal-info",
    sectionLabel: "Personal info",
    questionId: "pi-address",
    questionLabel: "Address",
    conditional: false,
  },
  {
    sectionId: "personal-info",
    sectionLabel: "Personal info",
    questionId: "pi-employment",
    questionLabel: "Employment",
    conditional: false,
  },
  {
    sectionId: "personal-info",
    sectionLabel: "Personal info",
    questionId: "pi-job-duration",
    questionLabel: "Job duration",
    conditional: false,
  },
  {
    sectionId: "personal-info",
    sectionLabel: "Personal info",
    questionId: "pi-salary",
    questionLabel: "Salary",
    conditional: false,
  },
  {
    sectionId: "personal-info",
    sectionLabel: "Personal info",
    questionId: "pi-credit",
    questionLabel: "Credit",
    conditional: false,
  },

  {
    sectionId: "co-borrower",
    sectionLabel: "Co-borrower",
    questionId: "cb-name",
    questionLabel: "Legal name",
    conditional: true,
  },
  {
    sectionId: "co-borrower",
    sectionLabel: "Co-borrower",
    questionId: "cb-dob",
    questionLabel: "Date of birth",
    conditional: true,
  },
  {
    sectionId: "co-borrower",
    sectionLabel: "Co-borrower",
    questionId: "cb-relationship",
    questionLabel: "Relationship to borrower",
    conditional: true,
  },

  {
    sectionId: "car-house-details",
    sectionLabel: "Car / house details",
    questionId: "cd-make-model",
    questionLabel: "Make and model",
    conditional: false,
  },
  {
    sectionId: "car-house-details",
    sectionLabel: "Car / house details",
    questionId: "cd-year",
    questionLabel: "Vehicle year",
    conditional: false,
  },
  {
    sectionId: "car-house-details",
    sectionLabel: "Car / house details",
    questionId: "cd-value",
    questionLabel: "Vehicle value",
    conditional: false,
  },
  {
    sectionId: "car-house-details",
    sectionLabel: "Car / house details",
    questionId: "hd-property-type",
    questionLabel: "Property type",
    conditional: false,
  },
  {
    sectionId: "car-house-details",
    sectionLabel: "Car / house details",
    questionId: "hd-price",
    questionLabel: "Purchase price",
    conditional: false,
  },
  {
    sectionId: "car-house-details",
    sectionLabel: "Car / house details",
    questionId: "hd-occupancy",
    questionLabel: "Occupancy",
    conditional: false,
  },

  {
    sectionId: "loan-calc",
    sectionLabel: "Loan / mortgage calculation",
    questionId: "lc-price",
    questionLabel: "Purchase price",
    conditional: false,
  },
  {
    sectionId: "loan-calc",
    sectionLabel: "Loan / mortgage calculation",
    questionId: "lc-down",
    questionLabel: "Down payment",
    conditional: false,
  },
  {
    sectionId: "loan-calc",
    sectionLabel: "Loan / mortgage calculation",
    questionId: "lc-term",
    questionLabel: "Loan term",
    conditional: false,
  },
];

const LoanNavigation = () => {
 
  const [hasCoBorrower, setHasCoBorrower] = useState(true);

  const [currentQuestionId, setCurrentQuestionId] = useState("pi-address");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [answers, setAnswers] = useState({});

  const menuRef = useRef(null);

  const visibleQuestions = SECTIONS.filter(
    (item) => !item.conditional || hasCoBorrower
  );

  const visibleSectionIds = [
    ...new Set(visibleQuestions.map((item) => item.sectionId)),
  ];

  const currentQuestion = visibleQuestions.find((item) => item.questionId === currentQuestionId) ?? visibleQuestions[0];

  // Current section.
  const currentSectionId = currentQuestion?.sectionId;

  const currentQuestionIndex = visibleQuestions.findIndex((item) => item.questionId === currentQuestionId);

  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;

  const questionsCompleted = currentQuestionIndex + 1;
  const totalQuestions = visibleQuestions.length;
  
  const progressPercent = (questionsCompleted / totalQuestions) * 100;

  // Questions grouped by section for display only.
  // SECTIONS itself remains completely flat.
  const getQuestionsForSection = (sectionId: string) => {
    return visibleQuestions.filter(
      (item) => item.sectionId === sectionId
    );
  };

  function isAnswered(questionId) {
    const answerText = answers[questionId];
    if (!answerText) return false;
    return answerText.trim() !== "";
  }


  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find the first question belonging to a section.
  function getFirstQuestionInSection(sectionId: string) {
    return visibleQuestions.find(
      (item) => item.sectionId === sectionId
    );
  }

  // Go to previous section.
  function goToPreviousSection() {
    const currentSectionIndex = visibleSectionIds.indexOf(
      currentSectionId
    );

    if (currentSectionIndex > 0) {
      const previousSectionId =
        visibleSectionIds[currentSectionIndex - 1];

      const previousQuestion =
        getFirstQuestionInSection(previousSectionId);

      if (previousQuestion) {
        setCurrentQuestionId(previousQuestion.questionId);
      }
    }
  }

  // Go to next section.
  function goToNextSection() {
    const currentSectionIndex = visibleSectionIds.indexOf(currentSectionId);

    if ( currentSectionIndex >= 0 && currentSectionIndex < visibleSectionIds.length - 1) {
      const nextSectionId = visibleSectionIds[currentSectionIndex + 1];

      const nextQuestion = getFirstQuestionInSection(nextSectionId);

      if (nextQuestion) {
        setCurrentQuestionId(nextQuestion.questionId);
      }
    }
  }

  // Go to next question.
  function goToNextQuestion() {
    if (!isLastQuestion) {
      const nextQuestion = visibleQuestions[currentQuestionIndex + 1];

      setCurrentQuestionId(nextQuestion.questionId);
    }
  }

  // Select question from dropdown.
  function selectQuestion(questionId: string) {
    setCurrentQuestionId(questionId);
    setIsMenuOpen(false);
  }

  // Update answer.
  function updateAnswer(questionId: string, value: string) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: value,
    }));
  }

  // Toggle co-borrower.
  function handleCoBorrowerChange(nextHasCoBorrower: boolean) {
    setHasCoBorrower(nextHasCoBorrower);

    // If co-borrower is disabled while viewing
    // a co-borrower question, move back to the first question.
    if (!nextHasCoBorrower && currentSectionId === "co-borrower") {
      setCurrentQuestionId(visibleQuestions[0].questionId);
    }
  }

  const currentSectionIndex = visibleSectionIds.indexOf(currentSectionId);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === visibleSectionIds.length - 1;

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-12">
      <div className="w-full max-w-sm">
        <span className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2.5">
          Navigation
        </span>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md shadow-slate-900/5 px-4 pt-4 pb-3">
          {/* Row with left arrow, section dropdown, right arrow */}
          <div className="flex items-center justify-between mb-2.5">
            <button
              onClick={goToPreviousSection}
              disabled={isFirstSection}
              aria-label="Previous section"
              className={`flex items-center justify-center w-[30px] h-[30px] rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors ${
                isFirstSection ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            <div className="relative flex-1" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full flex items-center justify-center gap-1.5 text-[15px] font-bold text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {currentSection.label}
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMenuOpen && (
                <ul className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-64 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 p-1.5 z-10">
                  {visibleSections.map((section) => (
                    <li key={section.id}>
                      {/* Section header (not clickable to select, just a label) */}
                      <p className="text-xs px-2.5 py-1.5 text-slate-400 font-semibold uppercase tracking-wide">
                        {section.label}
                      </p>

                     
                      <ul className="mb-1 pl-4 ml-1 border-l border-slate-100">
                        {section.questions.map((question) => {
                          const isSelected = question.id === currentQuestionId;
                          const answered = isAnswered(question.id);

                          let textColor = "text-slate-300"; // not answered yet
                          if (answered) textColor = "text-slate-700 font-medium";
                          if (isSelected) textColor = "text-slate-900 font-semibold";

                          return (
                            <li key={question.id}>
                              <button
                                onClick={() => selectQuestion(question.id)}
                                className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors hover:bg-slate-50 ${textColor} ${
                                  isSelected ? "bg-blue-50" : ""
                                }`}
                              >
                                {question.label}
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
              onClick={goToNextSection}
              disabled={isLastSection}
              aria-label="Next section"
              className={`flex items-center justify-center w-[30px] h-[30px] rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors ${
                isLastSection ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Progress bar: fills up as you move through every question */}
          <div className="w-full h-[3px] bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* The actual question the person answers */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="block text-xs font-medium text-slate-400 mb-1">
              {currentSection.label}
            </span>
            <label
              htmlFor="answer-input"
              className="block text-base font-semibold text-slate-900 mb-2"
            >
              {currentQuestion.label}
            </label>
            <input
              id="answer-input"
              type="text"
              placeholder="Type your answer"
              value={answers[currentQuestion.id] ?? ""}
              onChange={(event) =>
                updateAnswer(currentQuestion.id, event.target.value)
              }
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />

            <button
              onClick={goToNextQuestion}
              disabled={isLastQuestion}
              className="mt-3 w-full text-sm font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? "Last question" : "Continue"}
            </button>
          </div>
        </div>

        {/* Toggle for whether there's a co-borrower */}
        <div className="mt-4 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
          <span className="text-sm text-slate-600">
            Applying with a co-borrower?
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleCoBorrowerChange(true)}
              className={`text-sm px-3 py-1 rounded-md border transition-colors ${
                hasCoBorrower
                  ? "bg-blue-600 border-blue-600 text-white font-semibold"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleCoBorrowerChange(false)}
              className={`text-sm px-3 py-1 rounded-md border transition-colors ${
                !hasCoBorrower
                  ? "bg-blue-600 border-blue-600 text-white font-semibold"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
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