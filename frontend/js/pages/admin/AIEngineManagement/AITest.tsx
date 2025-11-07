import { AIQuery, QuestionnairebuilderService } from "../../../api";
import React, { useState, useEffect } from "react";
import "./testStyle.css";

const AITest: React.FC = () => {
  // States
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [qResponses, setQResponses] = useState<
    { question: string; answer: any }[]
  >([]);
  const [showWorkout, setShowWorkout] = useState(false);
  const [currentQuestionnaireIndex, setCurrentQuestionnaireIndex] = useState(0);
  const [modifyResults, setModifyResults] = useState(false);
  const [modifications, setModifications] = useState<{
    days: Record<number, boolean>;
    activities: Record<string, boolean>;
    exercises: Record<string, boolean>;
  }>({
    days: {},
    activities: {},
    exercises: {},
  });
  const [uniqueExercises, setUniqueExercises] = useState<
    { name: string; replace: boolean }[]
  >([]);

  /* ───────────── Fetch questionnaire ───────────── */
  useEffect(() => {
    QuestionnairebuilderService.questionnairebuilderGetquestionnairesRetrieve()
      .then((res:any[]) => setQuestionnaires(res))
      .catch(console.error);
  }, []);

  // Sets a list of unique exercise values when the user gets the response
  useEffect(() => {
    if (response?.days) {
      const uniqueList = Array.from(
        new Set(
          response.days.flatMap(day =>
            day.segments.flatMap(seg =>
              seg.segments.map(ex => ex.exercise)
            )
          )
        )
      ).map(name => ({ name, replace: false }));

      setUniqueExercises(uniqueList);
    }
  }, [response]);

  
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
    setModifyResults(false);
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


  const requestModifiedWorkout = async () => {
    if (!response?.days) return;

    const partialPayload = {
      request_type: "modify_workout",
      based_on: response.uid || null,
      days: response.days.map((day, dayIdx) => ({
        ...day,
        replace: !!modifications.days[dayIdx],
        segments: day.segments.map((segment, segIdx) => ({
          ...segment,
          replace: !!modifications.activities[`${dayIdx}_${segIdx}`],
          segments: segment.segments.map((ex, exIdx) => ({
            ...ex,
            replace: !!modifications.exercises[`${dayIdx}_${segIdx}_${exIdx}`],
          })),
        })),
      })),
    };

    const fullPayload = {
      "exercises_to_remove": uniqueExercises, 
      "workout_to_be_changed": partialPayload,
      "user_profile_data": qResponses
    }


    console.log("📤 Sending modification request:", fullPayload);

    try {
      setLoading(true);
      const res = await AIQuery.ModifyQueryGemini(JSON.stringify(fullPayload, null, 2));
      //setNewWorkout(res);
      console.log("✅ Clean response:", res);
      setResponse(res);
      setModifications({days: {}, activities: {}, exercises: {}})
      setModifyResults(false);
    } catch (err) {
      console.error("❌ Modify request error:", err);
    } finally {
      setLoading(false);
    }
  }

  const mainJSX = () => {
    return (
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
    )
  }
  const baseResultsJSX = () => {
    return(
      /* ───────────── Results Section ───────────── */
      <div className="workout-container">
        <div className="return-header">
          <button className="btn-secondary" onClick={resetAll}>
            ← Back to Questionnaire
          </button>
        </div>

        <h1 className="week-title">🏋️ This week</h1>
        <h3>
          Click here to modify this routine
        </h3>
        <button onClick={() => setModifyResults(true)}>Modify</button>
        
        {/* AI Engine Information */}
        {response.ai_engine_used && (
          <div className="ai-engine-info">
            <span className="ai-engine-text">Generated by {response.ai_engine_used.config_name}</span>
          </div>
        )}

        {response.days.map((day, dayIdx) => (
          <div key={dayIdx} className="day-card">
            <h2>
              Day {day.day_number}: {day.title}
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
                      <div className="exercise-header">
                        <strong>{ex.exercise}</strong>{" "}
                        <span>{ex.duration_seconds}s</span>
                      </div>
                      {ex.notes && <p className="exercise-notes">{ex.intensity} intensity</p>}
                      {ex.notes && <p className="exercise-notes">{ex.notes}</p>}
                      {ex.url && (
                        <div className="exercise-url">
                          <strong>Video URL:</strong>{" "}
                          <a 
                            href={ex.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="url-link"
                          >
                            {ex.url}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const modifyBaseResultsJSX = () => {
    const toggleDay = (dayIdx: number) => {
      const isNowChecked = !modifications.days[dayIdx];
      const newState = { ...modifications };

      // Toggle day
      newState.days[dayIdx] = isNowChecked;

      // Cascade to all activities and exercises under this day
      const day = response?.days?.[dayIdx];
      if (day) {
        day.segments.forEach((segment, segIdx) => {
          const actKey = `${dayIdx}_${segIdx}`;
          newState.activities[actKey] = isNowChecked;

          segment.segments.forEach((_, exIdx) => {
            const exKey = `${dayIdx}_${segIdx}_${exIdx}`;
            newState.exercises[exKey] = isNowChecked;
          });
        });
      }

      setModifications(newState);
    };

    const toggleActivity = (dayIdx: number, segIdx: number) => {
      const key = `${dayIdx}_${segIdx}`;
      const isNowChecked = !modifications.activities[key];
      const newState = { ...modifications };

      // Toggle activity
      newState.activities[key] = isNowChecked;

      // Cascade to all exercises within this activity
      const segment = response?.days?.[dayIdx]?.segments?.[segIdx];
      if (segment) {
        segment.segments.forEach((_, exIdx) => {
          const exKey = `${dayIdx}_${segIdx}_${exIdx}`;
          newState.exercises[exKey] = isNowChecked;
        });
      }

      // Optional: update parent day — if all activities are checked, mark the day checked
      const day = response?.days?.[dayIdx];
      if (day) {
        const allChecked = day.segments.every(
          (_, sIdx) => newState.activities[`${dayIdx}_${sIdx}`]
        );
        newState.days[dayIdx] = allChecked;
      }

      setModifications(newState);
    };

    const toggleExercise = (dayIdx: number, segIdx: number, exIdx: number) => {
      const key = `${dayIdx}_${segIdx}_${exIdx}`;
      const isNowChecked = !modifications.exercises[key];
      const newState = { ...modifications, exercises: { ...modifications.exercises } };
      newState.exercises[key] = isNowChecked;

      // Update parent activity if all its exercises are checked
      const segment = response?.days?.[dayIdx]?.segments?.[segIdx];
      if (segment) {
        const allChecked = segment.segments.every(
          (_, eIdx) => newState.exercises[`${dayIdx}_${segIdx}_${eIdx}`]
        );
        newState.activities[`${dayIdx}_${segIdx}`] = allChecked;
      }

      // Update parent day if all activities are checked
      const day = response?.days?.[dayIdx];
      if (day) {
        const allChecked = day.segments.every(
          (_, sIdx) => newState.activities[`${dayIdx}_${sIdx}`]
        );
        newState.days[dayIdx] = allChecked;
      }

      setModifications(newState);
    };

    const toggleUniqueExercise = (exerciseName: string) => {
      setUniqueExercises(prev =>
        prev.map(ex =>
          ex.name === exerciseName ? { ...ex, replace: !ex.replace } : ex
        )
      );
    };
    
    return (
      <div className="workout-container">
        {/* ─────── Header Section ─────── */}
        <div className="header-row">
          <button onClick={resetAll} className="btn-secondary">← Back</button>
          <h2>Modify This Week’s Workout</h2>
        </div>

        {/* ─────── Action Buttons ─────── */}
        <div className="actions-row">
          <button onClick={() => setModifyResults(false)}>Cancel</button>
          <button onClick={requestModifiedWorkout} disabled={loading}>
            Request Changes
          </button>
        </div>

        {/* ─────── Workout Overview ─────── */}
        {response.days.map((day, dayIdx) => (
          <div key={dayIdx} className="day-card">
            {/* Day Checkbox */}
            <label className="day-label">
              <input
                type="checkbox"
                checked={!!modifications.days[dayIdx]}
                onChange={() => toggleDay(dayIdx)}
              />
              <strong>Day {day.day_number}: {day.title}</strong>
            </label>

            {/* ── Activity Level ── */}
            <div className="activity-list" style={{ marginLeft: "1.5rem" }}>
              {day.segments.map((segment, segIdx) => (
                <div key={segIdx} className="activity-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!modifications.activities[`${dayIdx}_${segIdx}`]}
                      onChange={() => toggleActivity(dayIdx, segIdx)}
                    />
                    {segment.activity} ({segment.sets} sets, {Math.floor(segment.duration_seconds / 60)} min)
                  </label>

                  {/* ─── Exercise Level ─── */}
                  <div className="exercise-list" style={{ marginLeft: "2.5rem" }}>
                    {segment.segments.map((ex, exIdx) => (
                      <div key={exIdx} className="exercise-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={!!modifications.exercises[`${dayIdx}_${segIdx}_${exIdx}`]}
                            onChange={() => toggleExercise(dayIdx, segIdx, exIdx)}
                          />
                          {ex.exercise}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ─────── Unique Exercise Section ─────── */}
        <div className="unique-exercises" style={{ marginTop: "2rem" }}>
          <h3>Exercise Checklist (Replace Specific Exercises)</h3>
          <div style={{ marginLeft: "1.5rem" }}>
            {uniqueExercises.map((ex, idx) => (
              <label key={idx} className="exercise-check" style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={ex.replace}
                  onChange={() => toggleUniqueExercise(ex.name)}
                />
                {ex.name}
              </label>
            ))}
          </div>
        </div>

      </div>
    );

  }



  /* ───────────── MAIN RETURN ───────────── */
  return (
    <div className="ai-test-container">
      {!showWorkout ? (
        mainJSX()
      ) : !modifyResults ? (
        baseResultsJSX()
      ) : (
        modifyBaseResultsJSX()
      )}
    </div>
  );
}

export default AITest;
