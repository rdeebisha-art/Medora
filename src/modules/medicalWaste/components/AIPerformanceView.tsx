import React, { useState } from 'react';
import { getActiveModelMetadata } from '../ai/model/modelRegistry';
import { modelTrainingService, TrainingPipelineStep } from '../services/modelTrainingService';
import { INITIAL_AI_CLASSES } from '../ai/model/classes';

export const AIPerformanceView: React.FC = () => {
  const [modelMeta, setModelMeta] = useState(getActiveModelMetadata());
  const [trainingInProgress, setTrainingInProgress] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<TrainingPipelineStep[]>([]);
  const [trainingReport, setTrainingReport] = useState<string | null>(null);

  const metrics = modelMeta.latestMetrics;

  const handleStartTraining = async () => {
    setTrainingInProgress(true);
    setTrainingReport(null);
    try {
      const nextVer = `medwaste-vision-v1.${Date.now().toString().slice(-3)}`;
      const result = await modelTrainingService.runTrainingPipeline(
        nextVer,
        (_currentStep, allSteps) => {
          setPipelineSteps([...allSteps]);
        }
      );
      setModelMeta(getActiveModelMetadata());
      setTrainingReport(result.report);
    } catch (err: any) {
      console.error(err);
      setTrainingReport(`Training pipeline failed: ${err.message || err}`);
    } finally {
      setTrainingInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                Rigorous Evaluation
              </span>
              <span className="text-xs text-teal-200">Held-Out Test Set Verification</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              AI Model Evaluation &amp; Supervised Training Pipeline
            </h2>
            <p className="text-xs text-teal-100/80 mt-0.5 max-w-2xl leading-relaxed">
              Evaluating on disjoint test data with zero data leakage. Distinguishes model confidence from ground-truth test accuracy.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartTraining}
            disabled={trainingInProgress}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto cursor-pointer min-h-[42px]"
          >
            {trainingInProgress ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Running 11-Step Pipeline...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Train New Model Iteration</span>
              </>
            )}
          </button>
        </div>

        {/* Confidence vs Accuracy Distinction Notice */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-teal-100 flex items-start gap-2">
          <span className="text-base">ℹ️</span>
          <div>
            <strong className="text-white">Strict Statistical Distinction:</strong>
            <span className="ml-1">
              "Confidence" is the model's internal softmax output for a specific image. "Model Accuracy" is the percentage of correct predictions calculated against an independently labeled, held-out test dataset ({metrics?.testSampleCount || 0} samples).
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-500">Test Accuracy</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            {metrics ? `${(metrics.overallAccuracy * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Held-out test set</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-500">Precision (Macro)</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {metrics ? `${(metrics.overallPrecision * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">TP / (TP + FP)</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-500">Recall (Macro)</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {metrics ? `${(metrics.overallRecall * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">TP / (TP + FN)</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-500">F1-Score</div>
          <div className="text-xl sm:text-2xl font-black text-teal-800 mt-1">
            {metrics ? `${(metrics.overallF1 * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Harmonic mean</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-500">mAP @ 0.50</div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
            {metrics ? `${(metrics.meanAveragePrecision * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Object detection</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-500">IoU Score</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">
            {metrics ? `${(metrics.intersectionOverUnion * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Bounding overlap</div>
        </div>
      </div>

      {/* Live Training Pipeline Progress Display (Active when training) */}
      {(trainingInProgress || pipelineSteps.length > 0) && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚙️</span>
              <h3 className="text-sm font-black text-slate-900">
                Supervised Training Pipeline Execution
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-teal-800">
              {pipelineSteps.filter((s) => s.status === 'COMPLETED').length} / {pipelineSteps.length} Steps
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {pipelineSteps.map((step) => {
              const isRunning = step.status === 'RUNNING';
              const isDone = step.status === 'COMPLETED';
              const isFail = step.status === 'FAILED';
              return (
                <div
                  key={step.stepNumber}
                  className={`p-3 rounded-2xl border text-xs transition-all ${
                    isRunning
                      ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold shadow-xs'
                      : isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : isFail
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">Step {step.stepNumber}</span>
                    <span>
                      {isRunning ? '⏳' : isDone ? '✓' : isFail ? '✕' : '•'}
                    </span>
                  </div>
                  <div className="font-bold mt-1 text-slate-900">{step.name}</div>
                  {step.details && (
                    <div className="text-[10px] text-slate-600 mt-1 leading-snug">{step.details}</div>
                  )}
                </div>
              );
            })}
          </div>

          {trainingReport && (
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
              {trainingReport}
            </pre>
          )}
        </div>
      )}

      {/* CONFUSION MATRIX HEATMAP */}
      {metrics && metrics.confusionMatrix && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                11x11 Confusion Matrix (Test Split)
              </h3>
              <p className="text-[11px] text-slate-500">
                Rows represent Ground Truth; Columns represent Model Prediction. Diagonal cells represent True Positives.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl font-bold">
              Model: {metrics.modelVersion}
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full text-center text-[10px] border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-2 text-left font-black">True \ Pred</th>
                  {metrics.confusionMatrix.classes.map((cls) => (
                    <th key={cls} className="p-2 truncate max-w-[65px]" title={cls}>
                      {cls.slice(0, 5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {metrics.confusionMatrix.matrix.map((row, rowIdx) => {
                  const trueClass = metrics.confusionMatrix.classes[rowIdx];
                  return (
                    <tr key={trueClass} className="hover:bg-slate-50/50">
                      <td className="p-2 text-left font-bold text-slate-800 font-sans truncate max-w-[120px]" title={trueClass}>
                        {trueClass}
                      </td>
                      {row.map((count, colIdx) => {
                        const isDiagonal = rowIdx === colIdx;
                        const isHit = count > 0;
                        return (
                          <td
                            key={colIdx}
                            className={`p-2 font-bold ${
                              isDiagonal && isHit
                                ? 'bg-emerald-100 text-emerald-950 font-black'
                                : !isDiagonal && isHit
                                ? 'bg-red-50 text-red-700 font-black'
                                : 'text-slate-300'
                            }`}
                          >
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-Class Precision & Recall Table */}
      {metrics && metrics.perClassMetrics && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900">Per-Class Performance Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-black uppercase text-[10px]">
                  <th className="p-2.5">Class Name</th>
                  <th className="p-2.5 text-right">Precision</th>
                  <th className="p-2.5 text-right">Recall</th>
                  <th className="p-2.5 text-right">F1-Score</th>
                  <th className="p-2.5 text-right">Test Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {Object.entries(metrics.perClassMetrics).map(([cls, val]) => (
                  <tr key={cls} className="hover:bg-slate-50">
                    <td className="p-2.5 font-sans font-bold capitalize text-slate-900">
                      {cls.replace(/_/g, ' ')}
                    </td>
                    <td className="p-2.5 text-right">{(val.precision * 100).toFixed(1)}%</td>
                    <td className="p-2.5 text-right">{(val.recall * 100).toFixed(1)}%</td>
                    <td className="p-2.5 text-right font-black text-teal-800">{(val.f1 * 100).toFixed(1)}%</td>
                    <td className="p-2.5 text-right text-slate-500">{val.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
