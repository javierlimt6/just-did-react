import { useState, useEffect } from "react";
import {
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Confetti from "react-confetti";
import { useAppStore } from "@/store";
import type { BrowserHistoryItem } from "@/types";
import { generateAISuggestion } from "@/utils/ai";
import { Button, Field, HStack, Textarea } from "@chakra-ui/react";


const TaskEntryView = () => {
  const {
    addActivityLog,
    setCurrentView,
    timerState,
    isTimerComplete,
    sendChromeMessage,
    setBrowserHistory,
  } = useAppStore();

  const [task, setTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [browserHistory, setBrowserHistoryLocal] = useState<
    BrowserHistoryItem[]
  >([]);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  useEffect(() => {
    // Load browser history when component mounts
    loadBrowserHistory();

    // Hide confetti after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000);

    return () => clearTimeout(timer);
  }, []);

  const loadBrowserHistory = async () => {
    try {
      console.log("Loading browser history...", timerState);
      const response = await sendChromeMessage("getBrowserHistory", {
        minutes: timerState.duration || 15,
      });
      console.log("Browser history response:", response);
      if (response.success) {
        setBrowserHistoryLocal(response.data);
        setBrowserHistory(response.data);
      }
    } catch (error) {
      console.error("Error loading browser history:", error);
    }
  };

  const generateSuggestion = () => {
    setIsGeneratingSuggestion(true);

    setTimeout(() => {
      const suggestion = generateAISuggestion(browserHistory);
      setTask(suggestion);
      setIsGeneratingSuggestion(false);
    }, 1500); // Simulate AI processing time
  };

  const handleSaveAndContinue = async () => {
    if (!task.trim()) {
      alert("Please describe what you accomplished!");
      return;
    }

    setIsLoading(true);
    try {
      addActivityLog({
        task: task.trim(),
        duration: timerState.duration || 0,
        browserHistory,
      });

      // Show success and redirect to landing
      setTimeout(() => {
        setCurrentView("landing");
      }, 500);
    } catch (error) {
      console.error("Error saving activity log:", error);
      setIsLoading(false);
    }
  };

  const handleSaveAndViewHistory = async () => {
    if (!task.trim()) {
      alert("Please describe what you accomplished!");
      return;
    }

    setIsLoading(true);
    try {
      addActivityLog({
        task: task.trim(),
        duration: timerState.duration || 0,
        browserHistory,
      });

      // Redirect to history view
      setTimeout(() => {
        setCurrentView("history");
      }, 500);
    } catch (error) {
      console.error("Error saving activity log:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Confetti Animation */}
      {showConfetti && isTimerComplete && (
        <Confetti
          width={400}
          height={600}
          recycle={false}
          numberOfPieces={50}
          gravity={0.3}
        />
      )}

      {/* Header Section - Now properly isolated */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2 text-white">Great Work!</h1>
        <p className="text-blue-100 text-sm opacity-90">
          What did you just accomplish?
        </p>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Task Entry Form */}
        <div className="glass-card p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
            </div>
            <Field.Root>
              <HStack justifyContent="space-around" className="mb-2">
                <Field.Label>Task Description</Field.Label>
                <Button 
                  onClick={generateSuggestion}
                  disabled={isGeneratingSuggestion}
                  colorPalette="teal" variant="subtle">
                    <SparklesIcon /> {isGeneratingSuggestion ? "Thinking..." : "Suggest"}
                </Button>
              </HStack>
              <Textarea value={task}
                onChange={(e) => setTask(e.target.value)}
                disabled={isLoading}
                placeholder="Click the button for AI suggestions"
                variant="outline"
              />
              <Field.HelperText>Use a few words</Field.HelperText>
            </Field.Root>
          </div>
          </div>
          <div className="glass-card w-full p-4 mt-6 flex gap-4 items-center">
          {/* Action Buttons - Improved proportions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <HStack>
              <Button 
              onClick={handleSaveAndContinue}
              disabled={isLoading || !task.trim()}
              colorPalette="teal" variant="solid">
                <ClockIcon /> {isLoading ? "Saving..." : "Save & Start New Session"}
              </Button>
              <Button colorPalette="teal" variant="surface" onClick={() => handleSaveAndViewHistory()}>
                Save & View History <DocumentTextIcon />
              </Button>
            </HStack>
          </div>
        </div>

        {/* Browser History Context */}
        {browserHistory.length > 0 && (
          <div className="glass-card p-4 bg-white/80">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">
              Recent Browser History
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {browserHistory.slice(0, 3).map((item, index) => (
                <div key={index} className="text-xs text-gray-600 truncate">
                  <span className="font-medium">{item.domain}</span> -{" "}
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskEntryView;