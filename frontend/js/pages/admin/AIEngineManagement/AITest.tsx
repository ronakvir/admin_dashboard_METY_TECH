import { AIQuery, QuestionnairebuilderService } from "../../../api";
import React, { useState, useEffect } from "react";
import "./testStyle.css";

const AITest: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [qResponses, setQResponses] = useState<
    { question: string; answer: any }[]
  >([]);
  const [showWorkout, setShowWorkout] = useState(false);
  const [currentQuestionnaireIndex, setCurrentQuestionnaireIndex] = useState(0);

  /* ───────────── Fetch questionnaire ───────────── */
  useEffect(() => {
    QuestionnairebuilderService.questionnairebuilderGetquestionnairesRetrieve()
      .then((res) => setQuestionnaires(res))
      .catch(console.error);
  }, []);

  const currentQuestionnaire = questionnaires[0];
  const currentQuestion =
    currentQuestionnaire?.questions?.[currentQuestionnaireIndex];

  /* ───────────── Update responses (JSON objects) ───────────── */
  const updateResponses = (
    question: string,
    answer: any,
    index: number
  ) => {
    const temp = [...qResponses];
    while (temp.length <= index) temp.push({ question: "", answer: {} });
    temp[index] = { question, answer };
    setQResponses(temp);
  };

  /* ───────────── Reset & Submit ───────────── */
  const resetAll = () => {
    setQResponses([]);
    setShowWorkout(false);
    setResponse(null);
    setCurrentQuestionnaireIndex(0);
  };

  const triggerQuery = async () => {
    setLoading(true);
    const formatted = JSON.stringify(qResponses, null, 2);

    try {
      const res = await AIQuery.QueryGemini(formatted);
      console.log("✅ Clean response:", res);
      setResponse(res);
      setShowWorkout(true);
    } catch (err) {
      console.error("❌ Query error:", err);
      setResponse({ error: "Error occurred" });
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestionnaire) return <div>Loading questionnaires...</div>;

  /* ───────────── MAIN RETURN ───────────── */
  return (
    <div className="ai-test-container">
      {!showWorkout ? (
        <>
          {/* Header */}
          <div className="header-row">
            <h4>{currentQuestionnaire.title}</h4>
          </div>

          {/* Question Display */}
          {currentQuestion && (
            <div className="question-grid">
              <div key={currentQuestion.id} className="question-card">
                <h5>{currentQuestion.text}</h5>

                {(() => {
                  switch (currentQuestion.type) {
                    case "slider":
                      return (
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={
                            qResponses[currentQuestionnaireIndex]?.answer?.value ||
                            50
                          }
                          onChange={(e) =>
                            updateResponses(
                              currentQuestion.text,
                              {
                                id: currentQuestion.id,
                                type: "slider",
                                value: Number(e.target.value),
                              },
                              currentQuestionnaireIndex
                            )
                          }
                        />
                      );

                    case "text":
                      return (
                        <input
                          type="text"
                          placeholder="Enter your answer"
                          value={
                            qResponses[currentQuestionnaireIndex]?.answer
                              ?.text || ""
                          }
                          onChange={(e) =>
                            updateResponses(
                              currentQuestion.text,
                              {
                                id: currentQuestion.id,
                                type: "text",
                                text: e.target.value,
                              },
                              currentQuestionnaireIndex
                            )
                          }
                        />
                      );

                    case "multichoice":
                      return (currentQuestion.answers || []).map(
                        (answer: any) => (
                          <label key={answer.id} className="option-row">
                            <input
                              type="radio"
                              name={`q_${currentQuestionnaireIndex}`}
                              checked={
                                qResponses[currentQuestionnaireIndex]?.answer
                                  ?.id === answer.id
                              }
                              onChange={() =>
                                updateResponses(
                                  currentQuestion.text,
                                  {
                                    id: answer.id,
                                    type: "multichoice",
                                    text: answer.text,
                                  },
                                  currentQuestionnaireIndex
                                )
                              }
                            />
                            {answer.text}
                          </label>
                        )
                      );

                    case "checkbox":
                      const currentAnswers =
                        qResponses[currentQuestionnaireIndex]?.answer
                          ?.selected || [];
                      return (currentQuestion.answers || []).map(
                        (answer: any) => {
                          const isChecked = currentAnswers.includes(answer.id);
                          const isNone =
                            answer.text.trim().toLowerCase() === "none";

                          return (
                            <label key={answer.id} className="option-row">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  let updated = [...currentAnswers];
                                  if (e.target.checked) {
                                    if (isNone) {
                                      updated = [answer.id]; // Only "None"
                                    } else {
                                      const none = (currentQuestion.answers || []).find(
                                        (a: any) =>
                                          a.text.trim().toLowerCase() === "none"
                                      );
                                      updated = updated.filter(
                                        (id) => id !== none?.id
                                      );
                                      updated.push(answer.id);
                                    }
                                  } else {
                                    updated = updated.filter(
                                      (id) => id !== answer.id
                                    );
                                  }
                                  updateResponses(
                                    currentQuestion.text,
                                    {
                                      id: currentQuestion.id,
                                      type: "checkbox",
                                      selected: updated,
                                    },
                                    currentQuestionnaireIndex
                                  );
                                }}
                              />
                              {answer.text}
                            </label>
                          );
                        }
                      );

                    default:
                      return null;
                  }
                })()}

                {/* Navigation buttons */}
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-start",
                  }}
                >
                  <button
                    onClick={() =>
                      setCurrentQuestionnaireIndex((i) => Math.max(i - 1, 0))
                    }
                    disabled={currentQuestionnaireIndex === 0}
                    className="nav-btn"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentQuestionnaireIndex((i) =>
                        Math.min(
                          i + 1,
                          currentQuestionnaire.questions.length - 1
                        )
                      )
                    }
                    disabled={
                      currentQuestionnaireIndex ===
                      currentQuestionnaire.questions.length - 1
                    }
                    className="nav-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {currentQuestionnaireIndex ===
            currentQuestionnaire.questions.length - 1 && (
            <div className="submit-container">
              <button
                className="btn-primary"
                onClick={triggerQuery}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          )}
        </>
      ) : (
        /* ───────────── Results Section ───────────── */
        <div className="workout-container">
          <div className="return-header">
            <button className="btn-secondary" onClick={resetAll}>
              ← Back to Questionnaire
            </button>
          </div>

          <h1 className="week-title">🏋️ Week {response.week_number + 1}</h1>

          {response.days.map((day, dayIdx) => (
            <div key={dayIdx} className="day-card">
              <h2>
                Day {day.day_number + 1}: {day.title}
              </h2>

              <div className="day-meta">
                <span>🎯 Goal: {day.goal}</span>
                <span>⚡ Difficulty: {day.difficulty}</span>
                <span>
                  ⏱️ Duration: {(day.total_duration_seconds / 60).toFixed(0)}{" "}
                  min
                </span>
              </div>

              {day.segments.map((segment, segIdx) => (
                <div key={segIdx} className="segment-card">
                  <div className="segment-header">
                    <h3>{segment.activity}</h3>
                    <span>
                      🔁 {segment.sets}{" "}
                      {segment.sets === 1 ? "Set" : "Sets"}
                    </span>
                    <span>
                      ⏱️ {Math.floor(segment.duration_seconds / 60)} min
                    </span>
                  </div>
                  <div className="segment-details">
                    {segment.segments.map((ex, exIdx) => (
                      <div key={exIdx} className="exercise-row">
                        <strong>{ex.exercise}</strong>{" "}
                        <span>{ex.duration_seconds}s</span>
                        {ex.notes && <p>{ex.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AITest;
