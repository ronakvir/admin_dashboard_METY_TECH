import React, { useState, useEffect } from "react";
import AITest from "./AITest";
import { AIConfig, AIQuery } from "../../../api";
import "./managementStyle.css";

/* 
═══════════════════════════════════════════════════════════
AI Engine Management – Admin interface for AI model configs
═══════════════════════════════════════════════════════════
*/
const AIManagement: React.FC = () => {
  const [showTest, setShowTest] = useState(false);
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null); // track which button is loading

  /* ───────────── Fetch Configurations ───────────── */
  useEffect(() => {
    if (!showTest) fetchConfigs();
  }, [showTest]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await AIQuery.getAIConfigurations();
      setConfigs(response);
    } catch (err) {
      console.error("❌ Error fetching configurations:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────── Save / Delete Configs ───────────── */
  const saveConfig = async (config: AIConfig) => {
    try {
      setButtonLoading("save");
      if (config.uid) {
        await AIQuery.updateAIConfiguration(config.uid, config);
      } else {
        await AIQuery.createAIConfiguration(config);
      }
      setEditingConfig(null);
      fetchConfigs();
    } catch (err) {
      console.error("❌ Save error:", err);
    } finally {
      setButtonLoading(null);
    }
  };

  const deleteConfig = async (uid: string) => {
    if (!window.confirm("Delete this configuration?")) return;
    try {
      setButtonLoading(uid); // use uid to track which delete button
      await AIQuery.deleteAIConfiguration(uid);
      fetchConfigs();
    } catch (err) {
      console.error("❌ Delete error:", err);
    } finally {
      setButtonLoading(null);
    }
  };

  /* ───────────── Pipeline Models ───────────── */
  const pipeline = configs
    .filter((c) => c.order > 0)
    .sort((a, b) => a.order - b.order);

  /* ───────────── UI Rendering ───────────── */
  return (
    <div className="ai-management-container">
      {/* Header Row */}
      <div className="header-row">
        <h2>AI Engine Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowTest(!showTest)}
          disabled={buttonLoading !== null}
        >
          {showTest ? "← Back" : "Launch AI Test Interface"}
        </button>
      </div>

      {!showTest ? (
        <div className="ai-management-intro">
          <p>
            Manage AI engine settings, models, and pipeline order here.
            <br />
            Click the button above to open the <strong>Test Interface</strong>.
          </p>

          {/* Pipeline Builder */}
          <PipelineEditor configs={configs} onSave={saveConfig} />

          {/* Edit / New Configuration Form */}
          {editingConfig && (
            <div className="config-form">
              <h3>
                {editingConfig.uid ? "Edit Configuration" : "New Configuration"}
              </h3>

              <label>
                Name:
                <input
                  type="text"
                  placeholder="Description of this model configuration"
                  value={editingConfig.name}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, name: e.target.value })
                  }
                />
              </label>

              <label>
                Model Name:
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. gemini/gemini-2.5-flash-lite"
                  value={editingConfig.model_name}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      model_name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                API Key:
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter model key"
                  value={editingConfig.api_key}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      api_key: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Initial Prompt:
                <textarea
                  value={editingConfig.system_prompt}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      system_prompt: e.target.value,
                    })
                  }
                  placeholder="Enter the AI system prompt..."
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const textarea = e.currentTarget;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newValue =
                        textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);

                      // update state with the new text
                      setEditingConfig({
                        ...editingConfig,
                        system_prompt: newValue,
                      });

                      // restore cursor position after the tab
                      requestAnimationFrame(() => {
                        textarea.selectionStart = textarea.selectionEnd = start + 1;
                      });
                    }
                  }}
                />
                <small className="form-hint">
                  <strong>Note:</strong> This is the prompt used when requesting an initial workout recommendation. When the model runs, this prompt will be followed by:
                  <ul>
                    <li>The list of available <code>categories</code></li>
                    <li>The user's submitted input</li>
                  </ul>
                </small>
              </label>

              <label>
                Modification Prompt:
                <textarea
                  value={editingConfig.modification_prompt}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      modification_prompt: e.target.value,
                    })
                  }
                  placeholder="Enter the AI system prompt..."
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const textarea = e.currentTarget;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newValue =
                        textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);

                      // update state with the new text
                      setEditingConfig({
                        ...editingConfig,
                        modification_prompt: newValue,
                      });

                      // restore cursor position after the tab
                      requestAnimationFrame(() => {
                        textarea.selectionStart = textarea.selectionEnd = start + 1;
                      });
                    }
                  }}
                />
                <small className="form-hint">
                  <strong>Note:</strong> This is the prompt used when requesting an updated, modified workout recommendation. When the model runs, this prompt will be preceded by:
                  <ul>
                    <li>User preferences and requested modifications</li>
                  </ul>
                  and followed by:
                  <ul>
                    <li>The list of available <code>categories</code>, except any categories explicitely chosen by the user to discard.</li>
                  </ul>
                </small>
              </label>
              <div className="form-buttons">
                <button
                  className="btn-primary"
                  disabled={buttonLoading === "save"}
                  onClick={() => saveConfig(editingConfig)}
                >
                  {buttonLoading === "save" ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn-secondary"
                  disabled={buttonLoading === "save"}
                  onClick={() => setEditingConfig(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Configurations Table */}
          <div className="config-section">
            <div className="config-header">
              <h3>Model Configurations</h3>
              <button
                className="btn-secondary"
                disabled={buttonLoading !== null}
                onClick={() =>
                  setEditingConfig({
                    uid: "",
                    name: "",
                    model_name: "",
                    api_key: "",
                    system_prompt: "",
                    modification_prompt: "",
                    order: 0,
                    created_at: "",
                    updated_at: "",
                  })
                }
              >
                ➕ Add New
              </button>
            </div>

            {loading ? (
              <p>Loading configurations...</p>
            ) : (
              <table className="config-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Model</th>
                    <th>Order</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((cfg) => (
                    <tr key={cfg.uid}>
                      <td>{cfg.name}</td>
                      <td>{cfg.model_name}</td>
                      <td>{cfg.order > 0 ? cfg.order : "—"}</td>
                      <td>{new Date(cfg.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-small"
                          disabled={buttonLoading !== null}
                          onClick={() => setEditingConfig(cfg)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-small btn-danger"
                          disabled={buttonLoading === cfg.uid}
                          onClick={() => deleteConfig(cfg.uid)}
                        >
                          {buttonLoading === cfg.uid ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <AITest />
      )}
    </div>
  );
};





/* 
════════════════════════════════════════════════════════════
Pipeline Editor – Controls model order in the failover chain
════════════════════════════════════════════════════════════
*/
interface PipelineEditorProps {
  configs: AIConfig[];
  onSave: (config: AIConfig) => Promise<void>;
}

const PipelineEditor: React.FC<PipelineEditorProps> = ({ configs, onSave }) => {
  const activePipeline = configs
    .filter((c) => c.order > 0)
    .sort((a, b) => a.order - b.order);

  const [slots, setSlots] = useState<number[]>([]);
  const [selectedModels, setSelectedModels] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const maxOrder = activePipeline.length
      ? Math.max(...activePipeline.map((c) => c.order))
      : 1;

    const allSlots = Array.from({ length: maxOrder }, (_, i) => i + 1);
    const initialSelections = Object.fromEntries(
      activePipeline.map((c) => [c.order, c.uid])
    );

    setSlots(allSlots);
    setSelectedModels(initialSelections);
  }, [configs]);

  const getAvailableModels = (currentSlot: number) => {
    const selectedUids = Object.entries(selectedModels)
      .filter(([slot]) => Number(slot) !== currentSlot)
      .map(([_, uid]) => uid);

    return configs.filter((c) => !selectedUids.includes(c.uid));
  };

  const handleModelChange = (slot: number, uid: string) => {
    setSelectedModels((prev) => {
      const updated = { ...prev };
      uid ? (updated[slot] = uid) : delete updated[slot];
      return updated;
    });
  };

  const addSlot = () => setSlots((prev) => [...prev, prev.length + 1]);

  const removeSlot = (slot: number) => {
    const lastSlot = Math.max(...slots);
    if (slot !== lastSlot) {
      alert("⚠️ You can only remove the last step in the pipeline.");
      return;
    }
    setSelectedModels((prev) => {
      const updated = { ...prev };
      delete updated[slot];
      return updated;
    });
    setSlots((prev) => prev.filter((s) => s !== slot));
  };

  const savePipeline = async () => {
    try {
      setSaving(true);
      const selectedUids = Object.values(selectedModels);

      // Reset unused models
      for (const cfg of configs) {
        if (cfg.order > 0 && !selectedUids.includes(cfg.uid)) {
          await onSave({ ...cfg, order: 0 });
        }
      }

      // Update selected models
      for (const [slot, uid] of Object.entries(selectedModels)) {
        const model = configs.find((c) => c.uid === uid);
        if (model) await onSave({ ...model, order: parseInt(slot, 10) });
      }

      alert("✅ Pipeline updated!");
    } catch (err) {
      console.error("❌ Pipeline save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pipeline-editor">
      <h3>Pipeline Builder</h3>

      {slots.map((slot) => {
        const currentUid = selectedModels[slot] || "";
        const options = getAvailableModels(slot);

        return (
          <>
            <div key={slot} className="pipeline-slot">
              <label>Step {slot}</label>
              <select
                value={currentUid}
                disabled={saving}
                onChange={(e) => handleModelChange(slot, e.target.value)}
              >
                <option value="">Select Model</option>
                {options.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.name} ({m.model_name})
                  </option>
                ))}
              </select>
              

              <button
                className="btn-small btn-danger"
                disabled={slot !== Math.max(...slots) || saving}
                onClick={() => removeSlot(slot)}
              >
                ✕
              </button>
            </div>

          
          </>
        );
      })}

      {/* Default Pipeline Entry. This in not changeable, but keeps the <select> format to maintain visual consistency */}
      <div className="pipeline-slot">
        <label>Default</label>
        <select>
          <option value="">Default .env-based Model (gemini/gemini-2.5.flash-lite)</option>
        </select>
      </div>

      <div className="pipeline-buttons">
        <button className="btn-secondary" disabled={saving} onClick={addSlot}>
          ➕ Add Step
        </button>
        <button className="btn-primary" disabled={saving} onClick={savePipeline}>
          {saving ? "Saving..." : "💾 Save Pipeline"}
        </button>
      </div>
    </div>
  );
};

export default AIManagement;
